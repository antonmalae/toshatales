import apiClient from './apiClient.js';

class UploadService {
  // Загрузка файла
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/media/upload', formData, {
        headers: {
          // Не устанавливаем Content-Type, браузер сам установит с boundary
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Получение списка медиа файлов
  async getMediaFiles(params = {}) {
    try {
      const response = await apiClient.get('/media', params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Удаление медиа файла
  async deleteMediaFile(id) {
    try {
      const response = await apiClient.delete(`/media/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const uploadService = new UploadService();

export default uploadService; 