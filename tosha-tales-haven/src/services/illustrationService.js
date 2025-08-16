import apiClient from './apiClient.js';

class IllustrationService {
  // Получить иллюстрации сказки
  async getStoryIllustrations(storyId) {
    try {
      // Принудительно очищаем кэш для этого endpoint
      apiClient.clearCache();
      
      const response = await apiClient.get(`/stories/${storyId}/illustrations`);
      return response;
    } catch (error) {
      console.error('Error getting illustrations:', error);
      throw error;
    }
  }

  // Добавить иллюстрацию к сказке
  async addStoryIllustration(storyId, illustrationData) {
    try {
      const response = await apiClient.post(`/stories/${storyId}/illustrations`, illustrationData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Обновить иллюстрацию
  async updateStoryIllustration(storyId, illustrationId, illustrationData) {
    try {
      const response = await apiClient.put(`/stories/${storyId}/illustrations/${illustrationId}`, illustrationData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Удалить иллюстрацию
  async deleteStoryIllustration(storyId, illustrationId) {
    try {
      const response = await apiClient.delete(`/stories/${storyId}/illustrations/${illustrationId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Изменить порядок иллюстраций
  async reorderStoryIllustrations(storyId, illustrationIds) {
    try {
      const response = await apiClient.put(`/stories/${storyId}/illustrations/reorder`, {
        illustrationIds
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Batch операции для иллюстраций
  async batchDeleteIllustrations(storyId, illustrationIds) {
    const operations = illustrationIds.map(id => ({
      endpoint: `/stories/${storyId}/illustrations/${id}`,
      options: { method: 'DELETE' }
    }));

    try {
      const results = await apiClient.batchIllustrationOperations(operations);
      
      // Проверяем результаты на ошибки
      const failedOperations = results.filter(result => 
        result.status === 'rejected' || (result.value && result.value.status >= 400)
      );
      
      if (failedOperations.length > 0) {
        console.error('Some batch delete operations failed:', failedOperations);
        throw new Error(`Failed to delete ${failedOperations.length} illustrations`);
      }
      
      return results;
    } catch (error) {
      console.error('Batch delete error:', error);
      throw error;
    }
  }

  // Batch добавление иллюстраций
  async batchAddIllustrations(storyId, illustrations) {
    const operations = illustrations.map(illustration => ({
      endpoint: `/stories/${storyId}/illustrations`,
      options: {
        method: 'POST',
        body: JSON.stringify(illustration)
      }
    }));

    try {
      const results = await apiClient.batchIllustrationOperations(operations);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // Полная замена иллюстраций (удаление старых + добавление новых)
  async replaceStoryIllustrations(storyId, newIllustrations) {
    try {
      // Получаем существующие иллюстрации
      const existingResponse = await this.getStoryIllustrations(storyId);
      const existingIllustrations = existingResponse.data || [];

      // Удаляем только те иллюстрации, которые действительно существуют в базе
      if (existingIllustrations.length > 0) {
        const deleteIds = existingIllustrations
          .filter(ill => ill.id && typeof ill.id === 'string' && ill.id.trim() !== '' && !ill.id.startsWith('temp_')) // Исключаем временные ID
          .map(ill => ill.id);
        
        if (deleteIds.length > 0) {
          try {
            // Проверяем, какие иллюстрации действительно существуют перед удалением
            const existingIds = [];
            
            for (const id of deleteIds) {
              try {
                const checkResponse = await this.getStoryIllustrations(storyId);
                const exists = checkResponse.data?.some(ill => ill.id === id);
                if (exists) {
                  existingIds.push(id);
                }
              } catch (checkError) {
                console.warn(`Failed to check illustration ${id}:`, checkError);
              }
            }
            
            if (existingIds.length > 0) {
              await this.batchDeleteIllustrations(storyId, existingIds);
            }
          } catch (deleteError) {
            console.warn('Warning: Some old illustrations could not be deleted:', deleteError);
            // Продолжаем выполнение, даже если удаление не удалось
          }
        }
      }

      // Добавляем новые иллюстрации batch операцией
      if (newIllustrations.length > 0) {
        await this.batchAddIllustrations(storyId, newIllustrations);
      }

      return { success: true };
    } catch (error) {
      console.error('Error replacing illustrations:', error);
      throw error;
    }
  }

  // Оптимизированное обновление иллюстраций с минимальными запросами
  async updateStoryIllustrationsOptimized(storyId, newIllustrations) {
    try {
      // Получаем существующие иллюстрации
      const existingResponse = await this.getStoryIllustrations(storyId);
      const existingIllustrations = existingResponse.data || [];

      // Определяем что нужно удалить, обновить и добавить
      const toDelete = [];
      const toAdd = [];
      const toUpdate = [];

      // Находим иллюстрации для удаления (те, которых нет в новых)
      existingIllustrations.forEach(existing => {
        const stillExists = newIllustrations.some(newIll => newIll.id === existing.id);
        if (!stillExists) {
          toDelete.push(existing.id);
        }
      });

      // Определяем новые иллюстрации и обновления
      newIllustrations.forEach(newIll => {
        if (!newIll.id) {
          // Новая иллюстрация
          toAdd.push(newIll);
        } else {
          // Обновление существующей
          const existing = existingIllustrations.find(ex => ex.id === newIll.id);
          if (existing && (
            existing.position_vertical !== newIll.position_vertical ||
            existing.position_horizontal !== newIll.position_horizontal ||
            existing.caption !== newIll.caption ||
            existing.order !== newIll.order ||
            existing.imageUrl !== newIll.imageUrl
          )) {
            toUpdate.push(newIll);
          }
        }
      });

      // Выполняем операции batch
      const operations = [];

      // Удаления
      toDelete.forEach(id => {
        operations.push({
          endpoint: `/stories/${storyId}/illustrations/${id}`,
          options: { method: 'DELETE' }
        });
      });

      // Добавления
      toAdd.forEach(illustration => {
        operations.push({
          endpoint: `/stories/${storyId}/illustrations`,
          options: {
            method: 'POST',
            body: JSON.stringify(illustration)
          }
        });
      });

      // Обновления
      toUpdate.forEach(illustration => {
        operations.push({
          endpoint: `/stories/${storyId}/illustrations/${illustration.id}`,
          options: {
            method: 'PUT',
            body: JSON.stringify(illustration)
          }
        });
      });

      if (operations.length > 0) {
        await apiClient.batchIllustrationOperations(operations);
      }

      return { success: true, operations: { delete: toDelete.length, add: toAdd.length, update: toUpdate.length } };
    } catch (error) {
      console.error('Error updating illustrations optimized:', error);
      throw error;
    }
  }
}

const illustrationService = new IllustrationService();
export default illustrationService; 