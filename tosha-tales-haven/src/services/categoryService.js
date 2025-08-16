import apiClient from './apiClient.js';

class CategoryService {
  // Получение всех категорий
  async getCategories() {
    try {
      const response = await apiClient.get('/categories', { 
        headers: { 'Cache-Control': 'no-cache' } 
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Создание новой категории (только для админов)
  async createCategory(categoryData) {
    try {
      const response = await apiClient.post('/categories', categoryData);
      // Очищаем кэш категорий после создания
      apiClient.clearCacheForEndpoint('/categories');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Обновление категории (только для админов)
  async updateCategory(id, categoryData) {
    try {
      const response = await apiClient.put(`/categories/${id}`, categoryData);
      // Очищаем кэш категорий после обновления
      apiClient.clearCacheForEndpoint('/categories');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Удаление категории (только для админов)
  async deleteCategory(id) {
    try {
      const response = await apiClient.delete(`/categories/${id}`);
      // Очищаем кэш категорий после удаления
      apiClient.clearCacheForEndpoint('/categories');
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const categoryService = new CategoryService();
export default categoryService; 