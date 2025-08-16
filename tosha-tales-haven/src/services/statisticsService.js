import apiClient from './apiClient.js';

class StatisticsService {
  // Получение общей статистики
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/admin/statistics');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Получение количества сказок
  async getStoriesCount() {
    try {
      const response = await apiClient.get('/admin/statistics/stories');
      return response.data?.count || 0;
    } catch (error) {
      console.error('Error getting stories count:', error);
      return 0;
    }
  }

  // Получение количества персонажей
  async getCharactersCount() {
    try {
      const response = await apiClient.get('/admin/statistics/characters');
      return response.data?.count || 0;
    } catch (error) {
      console.error('Error getting characters count:', error);
      return 0;
    }
  }

  // Получение количества категорий
  async getCategoriesCount() {
    try {
      const response = await apiClient.get('/admin/statistics/categories');
      return response.data?.count || 0;
    } catch (error) {
      console.error('Error getting categories count:', error);
      return 0;
    }
  }

  // Получение количества ролей
  async getRolesCount() {
    try {
      const response = await apiClient.get('/admin/statistics/roles');
      return response.data?.count || 0;
    } catch (error) {
      console.error('Error getting roles count:', error);
      return 0;
    }
  }

  // Получение количества медиафайлов
  async getMediaCount() {
    try {
      const response = await apiClient.get('/admin/statistics/media');
      return response.data?.count || 0;
    } catch (error) {
      console.error('Error getting media count:', error);
      return 0;
    }
  }

  // Получение всех метрик одновременно
  async getAllMetrics() {
    try {
      const [storiesCount, charactersCount, categoriesCount, rolesCount, mediaCount] = await Promise.all([
        this.getStoriesCount(),
        this.getCharactersCount(),
        this.getCategoriesCount(),
        this.getRolesCount(),
        this.getMediaCount()
      ]);

      return {
        stories: storiesCount,
        characters: charactersCount,
        categories: categoriesCount,
        roles: rolesCount,
        media: mediaCount
      };
    } catch (error) {
      console.error('Error getting all metrics:', error);
      return {
        stories: 0,
        characters: 0,
        categories: 0,
        roles: 0,
        media: 0
      };
    }
  }
}

const statisticsService = new StatisticsService();
export default statisticsService; 