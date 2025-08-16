import apiClient from './apiClient.js';

class UserService {
  // Получить всех пользователей с пагинацией и поиском
  async getUsers(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/users?${queryParams.toString()}`);
    
    // Проверяем, что ответ содержит нужные данные
    if (response && response.users) {
      return response;
    } else {
      return response;
    }
  }

  // Получить пользователя по ID
  async getUserById(id) {
    const response = await apiClient.get(`/users/${id}`);
    return response;
  }

  // Создать нового пользователя
  async createUser(userData) {
    const response = await apiClient.post('/users', userData);
    return response;
  }

  // Обновить пользователя
  async updateUser(id, userData) {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response;
  }

  // Изменить пароль
  async changePassword(passwordData) {
    const response = await apiClient.post('/users/change-password', passwordData);
    return response;
  }

  // Сбросить пароль пользователя
  async resetPassword(userId) {
    const response = await apiClient.post('/users/reset-password', { userId });
    return response;
  }

  // Активировать/деактивировать пользователя
  async toggleUserStatus(id) {
    const response = await apiClient.patch(`/users/${id}/toggle-status`);
    return response;
  }

  // Удалить пользователя
  async deleteUser(id) {
    const response = await apiClient.delete(`/users/${id}`);
    return response;
  }
}

export default new UserService();
