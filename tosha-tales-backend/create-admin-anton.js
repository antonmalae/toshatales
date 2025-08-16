import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Создание администратора admin@tosha-tales.com...');
    
    // Проверяем, существует ли уже пользователь с таким email
    const existingUser = await prisma.user.findFirst({
      where: { email: 'admin@tosha-tales.com' }
    });
    
    if (existingUser) {
      console.log('Пользователь уже существует:', existingUser.email);
      return;
    }
    
    // Создаем хеш пароля
    const password = 'admin123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Создаем администратора
    const admin = await prisma.user.create({
      data: {
        email: 'admin@tosha-tales.com',
        fullName: 'Администратор системы',
        passwordHash: passwordHash,
        role: 'ADMIN',
        isActive: true
      }
    });
    
    console.log('✅ Администратор успешно создан!');
    console.log('Email:', admin.email);
    console.log('Пароль:', password);
    console.log('Роль:', admin.role);
    
  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
