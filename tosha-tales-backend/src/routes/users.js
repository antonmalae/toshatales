import express from 'express';
import { Router } from 'express';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  changePassword, 
  resetPassword, 
  toggleUserStatus, 
  deleteUser 
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Используем существующий rate limiter для аутентификации

// Получить всех пользователей (с пагинацией и поиском)
router.get('/', protect, authorize('ADMIN'), getUsers);

// Получить пользователя по ID
router.get('/:id', protect, authorize('ADMIN'), getUserById);

// Создать нового пользователя
router.post('/', protect, authorize('ADMIN'), createUser);

// Обновить пользователя
router.put('/:id', protect, authorize('ADMIN'), updateUser);

// Изменить пароль (для себя)
router.post('/change-password', protect, authLimiter, changePassword);

// Сбросить пароль (админом для другого пользователя)
router.post('/reset-password', protect, authorize('ADMIN'), authLimiter, resetPassword);

// Активировать/деактивировать пользователя
router.patch('/:id/toggle-status', protect, authorize('ADMIN'), toggleUserStatus);

// Удалить пользователя
router.delete('/:id', protect, authorize('ADMIN'), deleteUser);

export default router;
