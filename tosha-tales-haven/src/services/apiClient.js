const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.rateLimitInfo = {
      remaining: 100,
      reset: Date.now() + 15 * 60 * 1000, // 15 минут
      retryAfter: 0
    };
    
    // Глобальный дебаунс для предотвращения спама запросов
    this.requestDebouncer = new Map();
    this.globalRequestCount = 0;
    this.lastRequestTime = 0;
    this.minRequestInterval = 100; // Минимальный интервал между запросами (100ms)
    
    // Ограничение количества одновременных запросов
    this.maxConcurrentRequests = 3;
    this.activeRequests = 0;
  }

  // Дебаунс функция для предотвращения спама запросов
  debounceRequest(key, fn, delay = 300) {
    if (this.requestDebouncer.has(key)) {
      clearTimeout(this.requestDebouncer.get(key));
    }
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
      
      this.requestDebouncer.set(key, timeoutId);
    });
  }

  // Проверка глобального лимита запросов
  async checkGlobalRateLimit() {
    const now = Date.now();
    
    // Если прошло мало времени с последнего запроса, ждем
    if (now - this.lastRequestTime < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - (now - this.lastRequestTime);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Если слишком много активных запросов, ждем
    if (this.activeRequests >= this.maxConcurrentRequests) {
      const waitTime = 200;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
    this.activeRequests++;
  }

  // Освобождение слота активного запроса
  releaseRequestSlot() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }

  // Кэширование с TTL
  getCacheKey(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return `${endpoint}?${queryString}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data, ttl = 5 * 60 * 1000) { // 5 минут по умолчанию
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  // Адаптивная задержка на основе rate limiting
  async getAdaptiveDelay() {
    const now = Date.now();
    if (now < this.rateLimitInfo.reset) {
      const remaining = this.rateLimitInfo.remaining;
      if (remaining < 10) {
        return 2000; // 2 секунды если мало запросов осталось
      } else if (remaining < 30) {
        return 1000; // 1 секунда если среднее количество
      }
    }
    return 200; // 200ms по умолчанию
  }

  // Batch операции
  async processBatch(requests) {
    const results = [];
    const batchSize = 2; // Уменьшаем размер батча для снижения нагрузки
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(req => this.request(req.endpoint, req.options));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);
        
        // Увеличиваем задержку между батчами
        if (i + batchSize < requests.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        results.push({ status: 'rejected', reason: error });
      }
    }
    
    return results;
  }

  // Улучшенная обработка ошибок с адаптивными повторными попытками
  async requestWithRetry(endpoint, options = {}, maxRetries = 2) { // Уменьшаем количество retry
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const delay = await this.getAdaptiveDelay();
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const result = await this.request(endpoint, options);
        return result;
      } catch (error) {
        lastError = error;
        
        // Если это 429 ошибка, ждем дольше и не retry
        if (error.message.includes('429')) {
          const waitTime = Math.min(5000 * Math.pow(2, attempt), 30000); // Максимум 30 секунд
          
          if (attempt === maxRetries) {
            throw new Error('Превышен лимит запросов. Попробуйте позже.');
          }
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else if (error.message.includes('5')) {
          // Для 5xx ошибок ждем меньше
          const waitTime = 500 * (attempt + 1);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        if (attempt === maxRetries) {
          throw lastError;
        }
      }
    }
  }

  // Общий метод для HTTP запросов с улучшенной обработкой rate limiting
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Добавляем токен авторизации, если он есть
    const token = localStorage.getItem('authToken');
    
    if (token && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Не логируем ошибку для публичных эндпоинтов
      if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        console.warn('Попытка доступа к защищенному API без токена:', endpoint);
      }
    }

    try {
      const response = await fetch(url, config);
      
      // Обновляем информацию о rate limiting из заголовков
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const reset = response.headers.get('X-RateLimit-Reset');
      const retryAfter = response.headers.get('Retry-After');
      
      if (remaining !== null) {
        this.rateLimitInfo.remaining = parseInt(remaining);
      }
      if (reset !== null) {
        this.rateLimitInfo.reset = parseInt(reset) * 1000;
      }
      if (retryAfter !== null) {
        this.rateLimitInfo.retryAfter = parseInt(retryAfter) * 1000;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('HTTP ошибка:', response.status, errorData);
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      const data = await response.json();
      
          // Кэшируем GET запросы (кроме категорий и ролей для избежания проблем с кэшем)
    if ((options.method === 'GET' || !options.method) && !endpoint.includes('/categories') && !endpoint.includes('/roles')) {
      const cacheKey = this.getCacheKey(endpoint);
      this.setCache(cacheKey, data);
    }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    } finally {
      this.releaseRequestSlot();
    }
  }

  // GET запрос с кэшированием и дебаунсом
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    // Проверяем кэш для GET запросов
    const cacheKey = this.getCacheKey(endpoint, params);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Применяем глобальный rate limiting
    await this.checkGlobalRateLimit();
    
    // Дебаунс для GET запросов
    const debounceKey = `GET_${endpoint}`;
    return this.debounceRequest(debounceKey, () => this.requestWithRetry(url, { method: 'GET' }), 200);
  }

  // POST запрос с дебаунсом
  async post(endpoint, data = {}, options = {}) {
    await this.checkGlobalRateLimit();
    
    const config = {
      method: 'POST',
      ...options,
    };

    // Если data это FormData, не устанавливаем Content-Type
    if (data instanceof FormData) {
      config.body = data;
    } else {
      config.body = JSON.stringify(data);
      config.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
    }

    const debounceKey = `POST_${endpoint}`;
    return this.debounceRequest(debounceKey, () => this.requestWithRetry(endpoint, config), 300);
  }

  // PUT запрос с дебаунсом
  async put(endpoint, data = {}) {
    await this.checkGlobalRateLimit();
    
    const debounceKey = `PUT_${endpoint}`;
    return this.debounceRequest(debounceKey, () => this.requestWithRetry(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }), 300);
  }

  // DELETE запрос с дебаунсом
  async delete(endpoint) {
    await this.checkGlobalRateLimit();
    
    const debounceKey = `DELETE_${endpoint}`;
    return this.debounceRequest(debounceKey, () => this.requestWithRetry(endpoint, { method: 'DELETE' }), 300);
  }

  // PATCH запрос с дебаунсом
  async patch(endpoint, data = {}) {
    await this.checkGlobalRateLimit();
    
    const debounceKey = `PATCH_${endpoint}`;
    return this.debounceRequest(debounceKey, () => this.requestWithRetry(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }), 300);
  }

  // Batch операции для иллюстраций
  async batchIllustrationOperations(operations) {
    return this.processBatch(operations);
  }

  // Очистка кэша
  clearCache() {
    this.cache.clear();
  }

  // Очистить кэш для конкретного endpoint
  clearCacheForEndpoint(endpoint) {
    const keysToDelete = [];
    for (const [key] of this.cache) {
      if (key.includes(endpoint)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Получение статистики
  getStats() {
    return {
      cacheSize: this.cache.size,
      rateLimitInfo: this.rateLimitInfo,
      activeRequests: this.activeRequests,
      globalRequestCount: this.globalRequestCount
    };
  }
}

// Создаем экземпляр для использования в приложении
const apiClient = new ApiClient();

export default apiClient; 