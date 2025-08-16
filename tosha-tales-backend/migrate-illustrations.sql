-- Миграция системы позиционирования иллюстраций
-- Выполняйте команды по одной

-- 1. Добавляем новые поля
ALTER TABLE "story_illustrations" 
ADD COLUMN IF NOT EXISTS "position_horizontal" TEXT DEFAULT 'left';

ALTER TABLE "story_illustrations" 
ADD COLUMN IF NOT EXISTS "position_vertical" TEXT DEFAULT 'top';

-- 2. Мигрируем данные из старых полей
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

-- 3. Удаляем старые поля
ALTER TABLE "story_illustrations" DROP COLUMN IF EXISTS "horizontalPosition";
ALTER TABLE "story_illustrations" DROP COLUMN IF EXISTS "verticalPosition";

-- 4. Добавляем ограничения для enum значений
ALTER TABLE "story_illustrations" 
ADD CONSTRAINT "check_position_horizontal" 
CHECK ("position_horizontal" IN ('left', 'right'));

ALTER TABLE "story_illustrations" 
ADD CONSTRAINT "check_position_vertical" 
CHECK ("position_vertical" IN ('top', 'bottom'));

-- 5. Создаем индекс для оптимизации
CREATE INDEX IF NOT EXISTS "idx_story_illustrations_position" 
ON "story_illustrations" ("storyId", "position_vertical", "position_horizontal", "order");

-- 6. Проверяем результат
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'story_illustrations'
ORDER BY ordinal_position;
