import { logger } from './logger.js';

// Простой in-memory кэш
class Cache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live
  }

  // Установить значение в кэш
  set(key, value, ttlMs = 5 * 60 * 1000) { // 5 минут по умолчанию
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttlMs);
    
    logger.info(`Cache set: ${key}`);
  }

  // Получить значение из кэша
  get(key) {
    const value = this.cache.get(key);
    const expiry = this.ttl.get(key);
    
    if (!value || !expiry) {
      return null;
    }
    
    if (Date.now() > expiry) {
      // Кэш истек
      this.cache.delete(key);
      this.ttl.delete(key);
      logger.info(`Cache expired: ${key}`);
      return null;
    }
    
    logger.info(`Cache hit: ${key}`);
    return value;
  }

  // Удалить из кэша
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
    logger.info(`Cache delete: ${key}`);
  }

  // Очистить весь кэш
  clear() {
    this.cache.clear();
    this.ttl.clear();
    logger.info('Cache cleared');
  }

  // Получить статистику кэша
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Создаем глобальный экземпляр кэша
export const cache = new Cache();

// Middleware для кэширования
export const cacheMiddleware = (ttlMs = 5 * 60 * 1000) => {
  return (req, res, next) => {
    const key = `${req.method}:${req.originalUrl}`;
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      return res.json(cachedResponse);
    }
    
    // Перехватываем ответ для кэширования
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode === 200) {
        try {
          const responseData = JSON.parse(data);
          cache.set(key, responseData, ttlMs);
        } catch (e) {
          // Не кэшируем не-JSON ответы
        }
      }
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Функция для инвалидации кэша по паттерну
export const invalidateCachePattern = (pattern) => {
  const keys = Array.from(cache.cache.keys());
  const matchingKeys = keys.filter(key => key.includes(pattern));
  
  matchingKeys.forEach(key => cache.delete(key));
  logger.info(`Cache invalidated for pattern: ${pattern}, keys: ${matchingKeys.length}`);
}; 