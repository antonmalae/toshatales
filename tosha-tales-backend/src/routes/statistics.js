import express from 'express';
import {
  getDashboardStats,
  getStoriesCount,
  getCharactersCount,
  getCategoriesCount,
  getRolesCount,
  getMediaCount
} from '../controllers/statisticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Все маршруты требуют аутентификации и прав администратора
router.use(protect);
router.use(authorize('ADMIN'));

// GET /api/admin/statistics - Получить общую статистику дашборда
router.get('/', getDashboardStats);

// GET /api/admin/statistics/stories - Получить количество сказок
router.get('/stories', getStoriesCount);

// GET /api/admin/statistics/characters - Получить количество персонажей
router.get('/characters', getCharactersCount);

// GET /api/admin/statistics/categories - Получить количество категорий
router.get('/categories', getCategoriesCount);

// GET /api/admin/statistics/roles - Получить количество ролей
router.get('/roles', getRolesCount);

// GET /api/admin/statistics/media - Получить количество медиафайлов
router.get('/media', getMediaCount);

export default router; 