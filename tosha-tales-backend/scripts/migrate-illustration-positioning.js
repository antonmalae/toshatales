#!/usr/bin/env node

/**
 * Скрипт миграции для обновления системы позиционирования иллюстраций
 * 
 * Этот скрипт:
 * 1. Добавляет новые поля position_horizontal и position_vertical
 * 2. Мигрирует данные из старых полей
 * 3. Удаляет старые поля
 * 4. Добавляет ограничения и индексы
 * 
 * Запуск: node scripts/migrate-illustration-positioning.js
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/utils/logger.js';

const prisma = new PrismaClient();

async function migrateIllustrationPositioning() {
  try {
    logger.info('Начинаем миграцию системы позиционирования иллюстраций...');

    // 1. Проверяем текущую структуру таблицы
    logger.info('Проверяем текущую структуру таблицы...');
    
    // Получаем информацию о колонках
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'story_illustrations'
      ORDER BY ordinal_position;
    `;
    
    logger.info('Текущие колонки:', tableInfo);

    // 2. Добавляем новые поля (если их нет)
    logger.info('Добавляем новые поля позиционирования...');
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "story_illustrations" 
        ADD COLUMN IF NOT EXISTS "position_horizontal" TEXT DEFAULT 'left';
      `;
      logger.info('Добавлено поле position_horizontal');
    } catch (error) {
      logger.warn('Поле position_horizontal уже существует или ошибка:', error.message);
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "story_illustrations" 
        ADD COLUMN IF NOT EXISTS "position_vertical" TEXT DEFAULT 'top';
      `;
      logger.info('Добавлено поле position_vertical');
    } catch (error) {
      logger.warn('Поле position_vertical уже существует или ошибка:', error.message);
    }

    // 3. Мигрируем данные из старых полей (если они существуют)
    logger.info('Мигрируем данные из старых полей...');
    
    // Проверяем существование старых полей
    const hasOldFields = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'story_illustrations' 
      AND column_name IN ('horizontalPosition', 'verticalPosition');
    `;

    if (hasOldFields.length > 0) {
      logger.info('Найдены старые поля, начинаем миграцию данных...');
      
      // Мигрируем данные
      const migrationResult = await prisma.$executeRaw`
        UPDATE "story_illustrations" 
        SET 
          "position_horizontal" = CASE 
            WHEN "horizontalPosition" = 'left' THEN 'left'
            WHEN "horizontalPosition" = 'right' THEN 'right'
            WHEN "horizontalPosition" = 'center' THEN 'left'
            ELSE 'left'
          END,
          "position_vertical" = CASE 
            WHEN "verticalPosition" = 'top' THEN 'top'
            WHEN "verticalPosition" = 'bottom' THEN 'bottom'
            WHEN "verticalPosition" = 'middle' THEN 'top'
            ELSE 'top'
          END
        WHERE "horizontalPosition" IS NOT NULL OR "verticalPosition" IS NOT NULL;
      `;
      
      logger.info(`Обновлено записей: ${migrationResult}`);
      
      // Удаляем старые поля
      logger.info('Удаляем старые поля...');
      
      try {
        await prisma.$executeRaw`
          ALTER TABLE "story_illustrations" DROP COLUMN IF EXISTS "horizontalPosition";
        `;
        logger.info('Удалено поле horizontalPosition');
      } catch (error) {
        logger.warn('Ошибка при удалении horizontalPosition:', error.message);
      }
      
      try {
        await prisma.$executeRaw`
          ALTER TABLE "story_illustrations" DROP COLUMN IF EXISTS "verticalPosition";
        `;
        logger.info('Удалено поле verticalPosition');
      } catch (error) {
        logger.warn('Ошибка при удалении verticalPosition:', error.message);
      }
    } else {
      logger.info('Старые поля не найдены, пропускаем миграцию данных');
    }

    // 4. Добавляем ограничения для enum значений
    logger.info('Добавляем ограничения для enum значений...');
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "story_illustrations" 
        ADD CONSTRAINT "check_position_horizontal" 
        CHECK ("position_horizontal" IN ('left', 'right'));
      `;
      logger.info('Добавлено ограничение для position_horizontal');
    } catch (error) {
      logger.warn('Ограничение для position_horizontal уже существует или ошибка:', error.message);
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "story_illustrations" 
        ADD CONSTRAINT "check_position_vertical" 
        CHECK ("position_vertical" IN ('top', 'bottom'));
      `;
      logger.info('Добавлено ограничение для position_vertical');
    } catch (error) {
      logger.warn('Ограничение для position_vertical уже существует или ошибка:', error.message);
    }

    // 5. Создаем/обновляем индексы для оптимизации
    logger.info('Создаем индексы для оптимизации...');
    
    try {
      await prisma.$executeRaw`
        DROP INDEX IF EXISTS "idx_story_illustrations_position";
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "idx_story_illustrations_position" 
        ON "story_illustrations" ("storyId", "position_vertical", "position_horizontal", "order");
      `;
      logger.info('Создан индекс idx_story_illustrations_position');
    } catch (error) {
      logger.warn('Ошибка при создании индекса:', error.message);
    }

    // 6. Проверяем результат миграции
    logger.info('Проверяем результат миграции...');
    
    const finalTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'story_illustrations'
      ORDER BY ordinal_position;
    `;
    
    logger.info('Финальная структура таблицы:', finalTableInfo);

    // 7. Проверяем данные
    const illustrationsCount = await prisma.storyIllustration.count();
    const sampleIllustrations = await prisma.storyIllustration.findMany({
      take: 5,
      select: {
        id: true,
        position_horizontal: true,
        position_vertical: true,
        order: true,
        storyId: true
      }
    });
    
    logger.info(`Всего иллюстраций в базе: ${illustrationsCount}`);
    logger.info('Примеры иллюстраций после миграции:', sampleIllustrations);

    logger.info('✅ Миграция успешно завершена!');
    
  } catch (error) {
    logger.error('❌ Ошибка при миграции:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем миграцию
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateIllustrationPositioning()
    .then(() => {
      logger.info('Миграция завершена успешно');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Миграция завершилась с ошибкой:', error);
      process.exit(1);
    });
}

export default migrateIllustrationPositioning;
