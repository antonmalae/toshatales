import apiClient from './apiClient.js';

class RoleService {
  // Получение всех ролей
  async getRoles() {
    try {
      const response = await apiClient.get('/roles');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Создание новой роли (только для админов)
  async createRole(roleData) {
    try {
      const response = await apiClient.post('/roles', roleData);
      // Очищаем кэш ролей после создания
      apiClient.clearCacheForEndpoint('/roles');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Обновление роли (только для админов)
  async updateRole(id, roleData) {
    try {
      const response = await apiClient.put(`/roles/${id}`, roleData);
      // Очищаем кэш ролей после обновления
      apiClient.clearCacheForEndpoint('/roles');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Удаление роли (только для админов)
  async deleteRole(id) {
    try {
      const response = await apiClient.delete(`/roles/${id}`);
      // Очищаем кэш ролей после удаления
      apiClient.clearCacheForEndpoint('/roles');
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const roleService = new RoleService();
export default roleService; 