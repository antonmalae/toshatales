import apiClient from './apiClient.js';

class StoryService {
  // Получение всех историй с фильтрацией и пагинацией
  async getStories(params = {}) {
    try {
      const response = await apiClient.get('/stories', params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Получение одной истории по ID
  async getStory(id) {
    try {
      const response = await apiClient.get(`/stories/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Создание новой истории (только для админов)
  async createStory(storyData) {
    try {
      const response = await apiClient.post('/stories', storyData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Обновление истории (только для админов)
  async updateStory(id, storyData) {
    try {
      const response = await apiClient.put(`/stories/${id}`, storyData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Удаление истории (только для админов)
  async deleteStory(id) {
    try {
      const response = await apiClient.delete(`/stories/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Поставить лайк истории
  async likeStory(id) {
    try {
      const response = await apiClient.post(`/stories/${id}/like`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Убрать лайк с истории
  async unlikeStory(id) {
    try {
      const response = await apiClient.delete(`/stories/${id}/like`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Поставить рейтинг истории
  async rateStory(id, rating) {
    try {
      const response = await apiClient.post(`/stories/${id}/rate`, { rating });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Получение историй по категории
  async getStoriesByCategory(categoryId, params = {}) {
    try {
      const response = await apiClient.get(`/stories/category/${categoryId}`, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Поиск историй
  async searchStories(query, params = {}) {
    try {
      const response = await apiClient.get('/stories/search', { ...params, q: query });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Получение популярных историй
  async getPopularStories(params = {}) {
    try {
      const response = await apiClient.get('/stories/popular', params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Получение новых историй
  async getNewStories(params = {}) {
    try {
      const response = await apiClient.get('/stories/new', params);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const storyService = new StoryService();
export default storyService; 