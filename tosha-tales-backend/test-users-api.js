import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Загружаем переменные окружения
dotenv.config();

const prisma = new PrismaClient();

async function testUsersAPI() {
  try {
    console.log('🔍 Тестируем API пользователей...\n');
    
    // 1. Проверяем подключение к базе
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно');
    
    // 2. Проверяем, есть ли пользователи
    const userCount = await prisma.user.count();
    console.log(`📊 Количество пользователей в базе: ${userCount}`);
    
    if (userCount > 0) {
      // Получаем первого пользователя
      const firstUser = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });
      
      console.log('👤 Первый пользователь:', firstUser);
      
      // 3. Создаем JWT токен для этого пользователя
      const token = jwt.sign(
        { id: firstUser.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      console.log('🔑 JWT токен создан:', token.substring(0, 20) + '...');
      
      // 4. Тестируем API endpoint
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 API Response Status:', response.status);
      console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response Data:', data);
      } else {
        const errorData = await response.text();
        console.log('❌ API Error Response:', errorData);
      }
      
    } else {
      console.log('❌ Пользователи не найдены в базе');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUsersAPI();
