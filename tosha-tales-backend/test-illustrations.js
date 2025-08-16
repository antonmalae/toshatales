#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки API иллюстраций
 * Запуск: node test-illustrations.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testIllustrationsAPI() {
  try {
    console.log('🧪 Тестирование API иллюстраций...\n');

    // 1. Проверяем структуру таблицы
    console.log('1. Проверка структуры таблицы story_illustrations:');
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'story_illustrations'
      ORDER BY ordinal_position;
    `;
    console.log('Колонки:', tableInfo);
    console.log('');

    // 2. Проверяем существующие иллюстрации
    console.log('2. Проверка существующих иллюстраций:');
    const illustrations = await prisma.storyIllustration.findMany({
      take: 5,
      select: {
        id: true,
        imageUrl: true,
        position_horizontal: true,
        position_vertical: true,
        caption: true,
        order: true,
        storyId: true
      }
    });
    console.log('Иллюстрации:', illustrations);
    console.log('');

    // 3. Проверяем ограничения
    console.log('3. Проверка ограничений:');
    const constraints = await prisma.$queryRaw`
      SELECT constraint_name, constraint_type, check_clause
      FROM information_schema.check_constraints 
      WHERE constraint_schema = 'public' 
      AND constraint_name LIKE '%position%';
    `;
    console.log('Ограничения:', constraints);
    console.log('');

    // 4. Проверяем индексы
    console.log('4. Проверка индексов:');
    const indexes = await prisma.$queryRaw`
      SELECT indexname, indexdef
      FROM pg_indexes 
      WHERE tablename = 'story_illustrations';
    `;
    console.log('Индексы:', indexes);
    console.log('');

    // 5. Тестируем создание иллюстрации
    console.log('5. Тест создания иллюстрации:');
    try {
      const testIllustration = await prisma.storyIllustration.create({
        data: {
          imageUrl: 'https://test.com/test-image.jpg',
          position_horizontal: 'right',
          position_vertical: 'bottom',
          caption: 'Тестовая иллюстрация',
          order: 1,
          storyId: 'test-story-id' // Замените на реальный ID сказки
        }
      });
      console.log('✅ Иллюстрация создана:', testIllustration);

      // Удаляем тестовую иллюстрацию
      await prisma.storyIllustration.delete({
        where: { id: testIllustration.id }
      });
      console.log('✅ Тестовая иллюстрация удалена');
    } catch (error) {
      console.log('❌ Ошибка создания иллюстрации:', error.message);
    }

    console.log('\n🎉 Тестирование завершено!');

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем тест
testIllustrationsAPI(); 