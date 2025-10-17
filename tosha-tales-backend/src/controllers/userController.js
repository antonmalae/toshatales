import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Валидация данных
const createUserSchema = z.object({
  email: z.string().email('Некорректный email'),
  fullName: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100, 'Имя не должно превышать 100 символов'),
  role: z.enum(['ADMIN']).default('ADMIN'),
  isActive: z.boolean().default(true),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать буквы верхнего и нижнего регистра, а также цифры')
});

const updateUserSchema = z.object({
  email: z.string().email('Некорректный email').optional(),
  fullName: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100, 'Имя не должно превышать 100 символов').optional(),
  role: z.enum(['ADMIN']).optional(),
  isActive: z.boolean().optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
  newPassword: z.string().min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать буквы верхнего и нижнего регистра, а также цифры'),
  confirmNewPassword: z.string().min(1, 'Подтверждение пароля обязательно')
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmNewPassword']
});

const resetPasswordSchema = z.object({
  userId: z.string().min(1, 'ID пользователя обязателен')
});

// Получить всех пользователей с пагинацией и поиском
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    // Построение условий поиска
    const where = {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } }
      ]
    };

    // Получение пользователей
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { [sortBy]: sortOrder },
      skip: parseInt(offset),
      take: parseInt(limit)
    });

    // Общее количество пользователей
    const total = await prisma.user.count({ where });

    // Логирование действия
    logger.info('Users retrieved', {
      actorId: req.user.id,
      action: 'GET_USERS',
      metadata: { page, limit, search, total }
    });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error getting users:', error);
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
};

// Получить пользователя по ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Логирование действия
    logger.info('User retrieved', {
      actorId: req.user.id,
      action: 'GET_USER',
      targetUserId: id
    });

    res.json(user);
  } catch (error) {
    logger.error('Error getting user:', error);
    res.status(500).json({ error: 'Ошибка при получении пользователя' });
  }
};

// Создать нового пользователя
const createUser = async (req, res) => {
  try {
    const validationResult = createUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Ошибка валидации', 
        details: validationResult.error.errors 
      });
    }

    const { email, fullName, role, isActive, password } = validationResult.data;

    // Проверка уникальности email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хеширование пароля
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        role,
        isActive,
        passwordHash
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Логирование действия
    logger.info('User created', {
      actorId: req.user.id,
      action: 'CREATE_USER',
      targetUserId: user.id,
      metadata: { email: user.email, role: user.role }
    });

    res.status(201).json(user);
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ error: 'Ошибка при создании пользователя' });
  }
};

// Обновить пользователя
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const validationResult = updateUserSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Ошибка валидации', 
        details: validationResult.error.errors 
      });
    }

    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверка уникальности email (если изменяется)
    if (req.body.email && req.body.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ 
        where: { email: req.body.email } 
      });
      if (emailExists) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
      }
    }

    // Обновление пользователя
    const updatedUser = await prisma.user.update({
      where: { id },
      data: validationResult.data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Логирование действия
    logger.info('User updated', {
      actorId: req.user.id,
      action: 'UPDATE_USER',
      targetUserId: id,
      metadata: { changes: validationResult.data }
    });

    res.json(updatedUser);
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
  }
};

// Изменить пароль пользователя
const changePassword = async (req, res) => {
  try {
    const validationResult = changePasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Ошибка валидации', 
        details: validationResult.error.errors 
      });
    }

    const { currentPassword, newPassword } = validationResult.data;
    const userId = req.user.id;

    // Получение пользователя с хешем пароля
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { passwordHash: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверка текущего пароля
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Неверный текущий пароль' });
    }

    // Хеширование нового пароля
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Обновление пароля
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    // Логирование действия
    logger.info('Password changed', {
      actorId: userId,
      action: 'CHANGE_PASSWORD',
      targetUserId: userId
    });

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    logger.error('Error changing password:', error);
    res.status(500).json({ error: 'Ошибка при изменении пароля' });
  }
};

// Сбросить пароль пользователя (админом)
const resetPassword = async (req, res) => {
  try {
    const validationResult = resetPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Ошибка валидации', 
        details: validationResult.error.errors 
      });
    }

    const { userId } = validationResult.data;

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Запрет на сброс собственного пароля
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Нельзя сбросить собственный пароль' });
    }

    // Генерация временного пароля
    const tempPassword = Math.random().toString(36).slice(-8) + 
                        Math.random().toString(36).toUpperCase().slice(-4) + 
                        Math.floor(Math.random() * 10);

    // Хеширование временного пароля
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(tempPassword, saltRounds);

    // Обновление пароля
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    // Логирование действия
    logger.info('Password reset', {
      actorId: req.user.id,
      action: 'RESET_PASSWORD',
      targetUserId: userId
    });

    res.json({ 
      message: 'Пароль успешно сброшен',
      temporaryPassword: tempPassword
    });
  } catch (error) {
    logger.error('Error resetting password:', error);
    res.status(500).json({ error: 'Ошибка при сбросе пароля' });
  }
};

// Активировать/деактивировать пользователя
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Запрет на деактивацию самого себя
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Нельзя деактивировать собственный аккаунт' });
    }

    // Переключение статуса
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Логирование действия
    logger.info('User status toggled', {
      actorId: req.user.id,
      action: 'TOGGLE_USER_STATUS',
      targetUserId: id,
      metadata: { newStatus: updatedUser.isActive }
    });

    res.json(updatedUser);
  } catch (error) {
    logger.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Ошибка при изменении статуса пользователя' });
  }
};

// Удалить пользователя
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Запрет на удаление самого себя
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Нельзя удалить собственный аккаунт' });
    }

    // Удаление пользователя
    await prisma.user.delete({ where: { id } });

    // Логирование действия
    logger.info('User deleted', {
      actorId: req.user.id,
      action: 'DELETE_USER',
      targetUserId: id,
      metadata: { email: user.email }
    });

    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ error: 'Ошибка при удалении пользователя' });
  }
};

export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  changePassword,
  resetPassword,
  toggleUserStatus,
  deleteUser
};
