import apiClient from './apiClient.js';

class CharacterService {
  // Получение всех персонажей с фильтрацией и пагинацией
  async getCharacters(params = {}) {
    try {
      const response = await apiClient.get('/characters', params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Получение одного персонажа по ID
  async getCharacter(id) {
    try {
      const response = await apiClient.get(`/characters/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Создание нового персонажа (только для админов)
  async createCharacter(characterData) {
    try {
      const response = await apiClient.post('/characters', characterData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Обновление персонажа (только для админов)
  async updateCharacter(id, characterData) {
    try {
      const response = await apiClient.put(`/characters/${id}`, characterData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Удаление персонажа (только для админов)
  async deleteCharacter(id) {
    try {
      const response = await apiClient.delete(`/characters/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Поставить лайк персонажу
  async likeCharacter(id) {
    try {
      const response = await apiClient.post(`/characters/${id}/like`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Убрать лайк с персонажа
  async unlikeCharacter(id) {
    try {
      const response = await apiClient.delete(`/characters/${id}/like`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Получение всех персонажей без пагинации (для админки)
  async getAllCharacters() {
    try {
      const response = await apiClient.get('/characters/all');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Получение персонажей по роли
  async getCharactersByRole(roleId, params = {}) {
    try {
      const response = await apiClient.get(`/characters/role/${roleId}`, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Поиск персонажей
  async searchCharacters(query, params = {}) {
    try {
      const response = await apiClient.get('/characters/search', { ...params, q: query });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Получение популярных персонажей
  async getPopularCharacters(params = {}) {
    try {
      const response = await apiClient.get('/characters/popular', params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Получение историй персонажа
  async getCharacterStories(id, params = {}) {
    try {
      const response = await apiClient.get(`/characters/${id}/stories`, params);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const characterService = new CharacterService();
export default characterService; 