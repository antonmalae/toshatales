import apiClient from './apiClient.js';

class SearchService {
  // Поиск историй и персонажей
  async search(query, params = {}) {
    try {
      const response = await apiClient.get('/search', { q: query, ...params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Поиск только историй
  async searchStories(query, params = {}) {
    try {
      const response = await apiClient.get('/search', { q: query, type: 'stories', ...params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Поиск только персонажей
  async searchCharacters(query, params = {}) {
    try {
      const response = await apiClient.get('/search', { q: query, type: 'characters', ...params });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const searchService = new SearchService();
export default searchService; 