import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Загружаем переменные окружения
dotenv.config();

console.log('🔍 Проверяем переменные окружения:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Установлен' : '❌ Не установлен');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Установлен' : '❌ Не установлен');
console.log('');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Тестируем подключение к базе данных...');
    
    // Подключаемся к базе
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно');
    
    // Проверяем, есть ли пользователи
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
      
      // Проверяем, есть ли администратор
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      });
      console.log(`👑 Количество администраторов: ${adminCount}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при работе с базой данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function testPasswordHashing() {
  try {
    console.log('\n🔍 Тестируем хеширование паролей...');
    
    const password = '123qweasdZXC';
    const saltRounds = 10;
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('✅ Пароль успешно захеширован');
    
    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log('✅ Проверка пароля:', isMatch ? 'Успешно' : 'Неудачно');
    
  } catch (error) {
    console.error('❌ Ошибка при хешировании паролей:', error);
  }
}

async function main() {
  console.log('🚀 Запуск тестов аутентификации...\n');
  
  await testDatabase();
  await testPasswordHashing();
  
  console.log('\n✅ Тесты завершены');
}

main().catch(console.error);
