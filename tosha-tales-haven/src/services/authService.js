import apiClient from './apiClient.js';

class AuthService {
  // Регистрация пользователя
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Вход пользователя
  async login(credentials) {
    try {
      console.log('🔐 Попытка входа с:', credentials.email);
      const response = await apiClient.post('/auth/login', credentials);
      console.log('📥 Получен ответ от сервера:', response);
      
      if (response.token) {
        console.log('🔑 Токен получен, сохраняем в localStorage');
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('✅ Токен сохранен в localStorage');
      } else {
        console.log('❌ Токен не найден в ответе');
      }
      return response;
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
      throw error;
    }
  }

  // Выход пользователя
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  // Получение текущего пользователя
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Обновление профиля пользователя
  async updateProfile(userData) {
    try {
      const response = await apiClient.put('/auth/profile', userData);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Смена пароля
  async changePassword(passwordData) {
    try {
      const response = await apiClient.put('/auth/password', passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Проверка авторизации
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  // Получение пользователя из localStorage
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Получение токена
  getToken() {
    return localStorage.getItem('authToken');
  }
}

const authService = new AuthService();
export default authService; 