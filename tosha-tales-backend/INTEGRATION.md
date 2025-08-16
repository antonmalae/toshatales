# Интеграция бэкенда с фронтендом

## 🔗 Настройка API клиента

### 1. Создайте API клиент в фронтенде

Создайте файл `src/services/api.js` в проекте фронтенда:

```javascript
const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Получить токен из localStorage
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Установить токен в localStorage
  setToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Удалить токен
  removeToken() {
    localStorage.removeItem('authToken');
  }

  // Базовый метод для запросов
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET запрос
  async get(endpoint) {
    return this.request(endpoint);
  }

  // POST запрос
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT запрос
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE запрос
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
```

### 2. Создайте сервисы для работы с API

#### Аутентификация (`src/services/authService.js`):

```javascript
import { apiClient } from './api.js';

export const authService = {
  // Регистрация
  async register(email, password) {
    const response = await apiClient.post('/auth/register', { email, password });
    if (response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  // Вход
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  // Выход
  async logout() {
    await apiClient.post('/auth/logout');
    apiClient.removeToken();
  },

  // Получить текущего пользователя
  async getCurrentUser() {
    return apiClient.get('/auth/me');
  },

  // Проверить, авторизован ли пользователь
  isAuthenticated() {
    return !!apiClient.getToken();
  },
};
```

#### Сказки (`src/services/storyService.js`):

```javascript
import { apiClient } from './api.js';

export const storyService = {
  // Получить список сказок
  async getStories(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/stories?${queryString}`);
  },

  // Получить сказку по ID
  async getStory(id) {
    return apiClient.get(`/stories/${id}`);
  },

  // Создать сказку (только для админов)
  async createStory(storyData) {
    return apiClient.post('/stories', storyData);
  },

  // Обновить сказку (только для админов)
  async updateStory(id, storyData) {
    return apiClient.put(`/stories/${id}`, storyData);
  },

  // Удалить сказку (только для админов)
  async deleteStory(id) {
    return apiClient.delete(`/stories/${id}`);
  },

  // Оценить сказку
  async rateStory(id, rating) {
    return apiClient.post(`/stories/${id}/rate`, { rating });
  },

  // Лайкнуть/анлайкнуть сказку
  async toggleLike(id) {
    return apiClient.post(`/stories/${id}/like`);
  },
};
```

#### Персонажи (`src/services/characterService.js`):

```javascript
import { apiClient } from './api.js';

export const characterService = {
  // Получить список персонажей
  async getCharacters(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/characters?${queryString}`);
  },

  // Получить персонажа по ID
  async getCharacter(id) {
    return apiClient.get(`/characters/${id}`);
  },

  // Создать персонажа (только для админов)
  async createCharacter(characterData) {
    return apiClient.post('/characters', characterData);
  },

  // Обновить персонажа (только для админов)
  async updateCharacter(id, characterData) {
    return apiClient.put(`/characters/${id}`, characterData);
  },

  // Удалить персонажа (только для админов)
  async deleteCharacter(id) {
    return apiClient.delete(`/characters/${id}`);
  },

  // Лайкнуть/анлайкнуть персонажа
  async toggleLike(id) {
    return apiClient.post(`/characters/${id}/like`);
  },
};
```

### 3. Обновите компоненты фронтенда

#### Пример обновления компонента Stories:

```javascript
import { useState, useEffect } from 'react';
import { storyService } from '../services/storyService.js';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await storyService.getStories({
        status: 'PUBLISHED',
        limit: 10,
        page: 1
      });
      setStories(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (storyId) => {
    try {
      await storyService.toggleLike(storyId);
      // Обновить список сказок
      loadStories();
    } catch (err) {
      console.error('Error liking story:', err);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      {stories.map(story => (
        <div key={story.id}>
          <h3>{story.title}</h3>
          <p>{story.description}</p>
          <button onClick={() => handleLike(story.id)}>
            ❤️ {story.totalLikes}
          </button>
        </div>
      ))}
    </div>
  );
};
```

## 🔧 Настройка CORS

Убедитесь, что в бэкенде настроен CORS для фронтенда:

```javascript
// В src/app.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

## 🚀 Запуск

1. **Запустите бэкенд:**
   ```bash
   cd tosha-tales-backend
   npm run dev
   ```

2. **Запустите фронтенд:**
   ```bash
   cd tosha-tales-haven
   npm run dev
   ```

3. **Проверьте работу:**
   - Бэкенд: http://localhost:3001/health
   - Фронтенд: http://localhost:5173

## 📝 Примеры использования

### Аутентификация:

```javascript
import { authService } from '../services/authService.js';

// Регистрация
try {
  const response = await authService.register('user@example.com', 'password123');
  console.log('User registered:', response.user);
} catch (error) {
  console.error('Registration failed:', error.message);
}

// Вход
try {
  const response = await authService.login('user@example.com', 'password123');
  console.log('User logged in:', response.user);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### Работа со сказками:

```javascript
import { storyService } from '../services/storyService.js';

// Получить сказки с фильтрацией
const stories = await storyService.getStories({
  category: 'category-id',
  ageGroup: '4-6 лет',
  page: 1,
  limit: 10
});

// Получить конкретную сказку
const story = await storyService.getStory('story-id');

// Оценить сказку
await storyService.rateStory('story-id', 5);

// Лайкнуть сказку
await storyService.toggleLike('story-id');
```

## 🔐 Обработка ошибок

```javascript
try {
  const data = await apiClient.get('/stories');
} catch (error) {
  if (error.message.includes('401')) {
    // Неавторизован - перенаправить на логин
    authService.logout();
    navigate('/login');
  } else if (error.message.includes('403')) {
    // Нет прав доступа
    showError('У вас нет прав для выполнения этого действия');
  } else {
    // Общая ошибка
    showError('Произошла ошибка. Попробуйте позже.');
  }
}
```

## 📊 Состояние загрузки

```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleAction = async () => {
  setLoading(true);
  setError(null);
  
  try {
    await someApiCall();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

Теперь ваш фронтенд готов к интеграции с бэкендом! 🎉 