#!/usr/bin/env node

/**
 * Простой тест для проверки API удаления иллюстраций
 * Запуск: node test-delete.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDeleteAPI() {
  try {
    console.log('🧪 Тестирование API удаления иллюстраций...\n');

    // 1. Проверяем существующие иллюстрации
    console.log('1. Проверка существующих иллюстраций:');
    const illustrations = await prisma.storyIllustration.findMany({
      take: 3,
      select: {
        id: true,
        imageUrl: true,
        position_horizontal: true,
        position_vertical: true,
        storyId: true
      }
    });
    
    if (illustrations.length === 0) {
      console.log('❌ Нет иллюстраций для тестирования');
      return;
    }
    
    console.log('Найдены иллюстрации:', illustrations);
    console.log('');

    // 2. Тестируем удаление
    const testIllustration = illustrations[0];
    console.log(`2. Тестирование удаления иллюстрации ${testIllustration.id}:`);
    
    try {
      const deleted = await prisma.storyIllustration.delete({
        where: { id: testIllustration.id }
      });
      console.log('✅ Иллюстрация успешно удалена:', deleted);
      
      // Восстанавливаем иллюстрацию для тестирования
      const restored = await prisma.storyIllustration.create({
        data: {
          imageUrl: testIllustration.imageUrl,
          position_horizontal: testIllustration.position_horizontal,
          position_vertical: testIllustration.position_vertical,
          order: 1,
          storyId: testIllustration.storyId
        }
      });
      console.log('✅ Иллюстрация восстановлена:', restored);
      
    } catch (error) {
      console.log('❌ Ошибка при удалении:', error.message);
    }

    console.log('\n🎉 Тестирование завершено!');

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем тест
testDeleteAPI();
