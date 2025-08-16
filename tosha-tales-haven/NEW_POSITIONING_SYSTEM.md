# Новая система позиционирования иллюстраций

## Обзор

Полностью переработанная система позиционирования иллюстраций, работающая как координаты X и Y - полностью независимо.

## Архитектура

### Структура данных

```typescript
interface Illustration {
  id?: string;
  imageUrl: string;
  verticalPosition: 'top' | 'middle' | 'bottom';  // Ось Y
  horizontalPosition: 'left' | 'center' | 'right'; // Ось X
  caption?: string;
  order?: number;
}
```

### Логика позиционирования

#### 1. Вертикальные зоны (Ось Y)

- **`top`** - над всем текстом сказки
- **`middle`** - в середине текста сказки (после примерно 50% текста)
- **`bottom`** - под всем текстом сказки

#### 2. Горизонтальные позиции (Ось X)

- **`left`** - выравнивание по левому краю
- **`center`** - выравнивание по центру
- **`right`** - выравнивание по правому краю

## Механика вставки

### 1. Определение вертикальных зон

1. **Зона "сверху"** - все иллюстрации с `verticalPosition: 'top'`
2. **Зона "посередине"** - все иллюстрации с `verticalPosition: 'middle'`
3. **Зона "снизу"** - все иллюстрации с `verticalPosition: 'bottom'`

### 2. Группировка по горизонтали

В каждой вертикальной зоне иллюстрации группируются по горизонтальной позиции:

```typescript
const leftIllustrations = illustrations.filter(ill => ill.horizontalPosition === 'left');
const centerIllustrations = illustrations.filter(ill => ill.horizontalPosition === 'center');
const rightIllustrations = illustrations.filter(ill => ill.horizontalPosition === 'right');
```

### 3. Порядок рендеринга

1. **Иллюстрации сверху** (если есть)
2. **Первая половина текста** (если есть иллюстрации посередине)
3. **Иллюстрации посередине** (если есть)
4. **Вторая половина текста** (если есть иллюстрации посередине)
5. **Иллюстрации снизу** (если есть)

## Визуализация

### Группировка иллюстраций

```typescript
const renderIllustrationGroup = (illustrations: Illustration[], zone: string) => {
  // Группируем по горизонтальной позиции
  const leftIllustrations = illustrations.filter(ill => ill.horizontalPosition === 'left');
  const centerIllustrations = illustrations.filter(ill => ill.horizontalPosition === 'center');
  const rightIllustrations = illustrations.filter(ill => ill.horizontalPosition === 'right');

  return (
    <div className="illustration-zone" style={{ clear: 'both' }}>
      {/* Иллюстрации слева */}
      {leftIllustrations.length > 0 && (
        <div style={{ float: 'left', marginRight: '16px' }}>
          {leftIllustrations.map(illustration => (
            <StoryIllustration key={illustration.id} {...illustration} />
          ))}
        </div>
      )}

      {/* Иллюстрации по центру */}
      {centerIllustrations.length > 0 && (
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          {centerIllustrations.map(illustration => (
            <StoryIllustration key={illustration.id} {...illustration} />
          ))}
        </div>
      )}

      {/* Иллюстрации справа */}
      {rightIllustrations.length > 0 && (
        <div style={{ float: 'right', marginLeft: '16px' }}>
          {rightIllustrations.map(illustration => (
            <StoryIllustration key={illustration.id} {...illustration} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### Разделение текста

```typescript
const splitContentIntoParagraphs = (content: string): string[] => {
  const cleanContent = content.replace(/<(?!\/?p[^>]*>)[^>]+>/g, '');
  const paragraphs = cleanContent
    .split(/<\/?p[^>]*>/i)
    .filter(p => p.trim().length > 0)
    .map(p => p.trim());
  
  if (paragraphs.length === 0) {
    return content.split('\n').filter(p => p.trim().length > 0).map(p => p.trim());
  }
  
  return paragraphs;
};
```

## Преимущества новой системы

### 1. Независимость осей
- Вертикальная и горизонтальная позиции полностью независимы
- Нет взаимозависимости между селектами
- Простая и понятная логика

### 2. Гибкость
- Любая комбинация вертикальной и горизонтальной позиции
- Группировка иллюстраций в одной зоне
- Легкое добавление новых позиций

### 3. Предсказуемость
- Четкие правила позиционирования
- Визуальная обратная связь
- Интуитивное управление

### 4. Производительность
- Эффективная группировка иллюстраций
- Минимальные пересчеты
- Оптимизированная структура DOM

## Примеры использования

### Пример 1: Иллюстрация сверху слева
```typescript
{
  imageUrl: "path/to/image.jpg",
  verticalPosition: "top",
  horizontalPosition: "left",
  caption: "Заголовочная иллюстрация",
  order: 1
}
```

### Пример 2: Иллюстрация посередине по центру
```typescript
{
  imageUrl: "path/to/image.jpg",
  verticalPosition: "middle",
  horizontalPosition: "center",
  caption: "Ключевой момент",
  order: 2
}
```

### Пример 3: Иллюстрация снизу справа
```typescript
{
  imageUrl: "path/to/image.jpg",
  verticalPosition: "bottom",
  horizontalPosition: "right",
  caption: "Заключительная иллюстрация",
  order: 3
}
```

## Технические изменения

### Frontend

1. **Обновлен интерфейс `Illustration`**:
   - Убраны `position` и `positionType`
   - Добавлены `verticalPosition` и `horizontalPosition`

2. **Обновлен компонент `StoryContent`**:
   - Новая логика группировки иллюстраций
   - Функция `renderIllustrationGroup` для рендеринга групп
   - Упрощенная логика разделения текста

3. **Обновлен компонент `StoryIllustration`**:
   - Убрана логика `positionType`
   - Применяется только горизонтальное позиционирование

4. **Обновлен UI формы**:
   - Независимые селекты для вертикальной и горизонтальной позиции
   - Контролируемые компоненты с состоянием

### Backend

1. **Обновлена схема базы данных**:
   - Заменены поля `position` и `positionType`
   - Добавлены поля `verticalPosition` и `horizontalPosition`

2. **Обновлен контроллер иллюстраций**:
   - Новая логика обработки позиций
   - Обновленная валидация

3. **Обновлена валидация**:
   - Новые схемы для `verticalPosition` и `horizontalPosition`
   - Убраны старые схемы для `position` и `positionType`

## Миграция данных

Для обновления существующих данных потребуется миграция:

```sql
-- Миграция для обновления структуры иллюстраций
ALTER TABLE story_illustrations 
ADD COLUMN vertical_position VARCHAR(10) DEFAULT 'middle',
ADD COLUMN horizontal_position VARCHAR(10) DEFAULT 'center';

-- Обновление существующих данных
UPDATE story_illustrations 
SET 
  vertical_position = CASE 
    WHEN position_type = 'vertical' THEN position
    ELSE 'middle'
  END,
  horizontal_position = CASE 
    WHEN position_type = 'horizontal' THEN position
    ELSE 'center'
  END;

-- Удаление старых колонок
ALTER TABLE story_illustrations 
DROP COLUMN position,
DROP COLUMN position_type;
```

## Тестирование

### Проверочный список

- [ ] Иллюстрации с `verticalPosition: 'top'` отображаются над всем текстом
- [ ] Иллюстрации с `verticalPosition: 'middle'` разделяют текст пополам
- [ ] Иллюстрации с `verticalPosition: 'bottom'` отображаются под всем текстом
- [ ] Иллюстрации с `horizontalPosition: 'left'` выравниваются по левому краю
- [ ] Иллюстрации с `horizontalPosition: 'center'` выравниваются по центру
- [ ] Иллюстрации с `horizontalPosition: 'right'` выравниваются по правому краю
- [ ] Несколько иллюстраций в одной зоне группируются правильно
- [ ] Форма добавления иллюстраций работает корректно
- [ ] Редактирование позиций работает независимо
- [ ] Сохранение и загрузка иллюстраций работает правильно

## Будущие улучшения

### 1. Адаптивность
- Автоматическое изменение позиций на мобильных устройствах
- Оптимизация для различных размеров экрана

### 2. Интерактивность
- Drag & drop для изменения позиций
- Предварительный просмотр позиционирования

### 3. Расширенная группировка
- Поддержка более сложных схем группировки
- Настройка отступов между иллюстрациями

### 4. Производительность
- Виртуализация для больших текстов
- Ленивая загрузка иллюстраций 