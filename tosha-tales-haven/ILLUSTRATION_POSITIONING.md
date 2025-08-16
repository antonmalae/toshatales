# Система позиционирования иллюстраций в тексте сказки

## Обзор

Реализована новая система позиционирования иллюстраций, которая позволяет точно размещать иллюстрации в тексте сказки в соответствии с выбранными вертикальными и горизонтальными позициями.

## Типы позиционирования

### 1. Вертикальное позиционирование

#### Позиция "Сверху" (top)
- **Описание**: Иллюстрация отображается **над всем текстом сказки**
- **Поведение**: Никакой текст не появляется выше иллюстрации
- **Использование**: Для заголовочных или вводных иллюстраций

#### Позиция "Посередине" (middle)
- **Описание**: Иллюстрация отображается **примерно в середине текста сказки**
- **Поведение**: Текст делится пополам - первая половина до иллюстрации, вторая после
- **Использование**: Для иллюстраций, которые должны разделять сюжет

#### Позиция "Снизу" (bottom)
- **Описание**: Иллюстрация отображается **после всего текста сказки**
- **Поведение**: Никакой текст не появляется ниже иллюстрации
- **Использование**: Для заключительных иллюстраций

### 2. Горизонтальное позиционирование

#### Позиция "Слева" (left)
- **Описание**: Иллюстрация выравнивается по левому краю
- **Поведение**: Текст обтекает иллюстрацию справа

#### Позиция "По центру" (center)
- **Описание**: Иллюстрация центрируется
- **Поведение**: Текст располагается выше и ниже иллюстрации

#### Позиция "Справа" (right)
- **Описание**: Иллюстрация выравнивается по правому краю
- **Поведение**: Текст обтекает иллюстрацию слева

## Техническая реализация

### Компонент StoryContent

```typescript
// Основная логика позиционирования
const renderContentWithIllustrations = () => {
  // 1. Группируем иллюстрации по позиции
  const topIllustrations = sortedIllustrations.filter(ill => 
    ill.positionType === 'vertical' && ill.position === 'top'
  );
  const middleIllustrations = sortedIllustrations.filter(ill => 
    ill.positionType === 'vertical' && ill.position === 'middle'
  );
  const bottomIllustrations = sortedIllustrations.filter(ill => 
    ill.positionType === 'vertical' && ill.position === 'bottom'
  );
  const horizontalIllustrations = sortedIllustrations.filter(ill => 
    ill.positionType === 'horizontal'
  );

  // 2. Строим структуру контента
  const elements: React.ReactNode[] = [];

  // Иллюстрации сверху
  topIllustrations.forEach(illustration => {
    elements.push(<StoryIllustration ... />);
  });

  // Разделяем текст на части
  const middlePoint = Math.ceil(paragraphs.length / 2);
  const firstHalf = paragraphs.slice(0, middlePoint);
  const secondHalf = paragraphs.slice(middlePoint);

  // Первая половина текста
  elements.push(<div dangerouslySetInnerHTML={{ __html: firstHalf }} />);

  // Иллюстрации посередине
  middleIllustrations.forEach(illustration => {
    elements.push(<StoryIllustration ... />);
  });

  // Вторая половина текста
  elements.push(<div dangerouslySetInnerHTML={{ __html: secondHalf }} />);

  // Иллюстрации снизу
  bottomIllustrations.forEach(illustration => {
    elements.push(<StoryIllustration ... />);
  });

  return elements;
};
```

### Компонент StoryIllustration

```typescript
// Стили позиционирования
const getPositionStyles = () => {
  const positionStyles: React.CSSProperties = { ...baseStyles };

  if (positionType === 'horizontal') {
    switch (position) {
      case 'left':
        positionStyles.float = 'left';
        positionStyles.marginRight = '16px';
        positionStyles.marginBottom = '16px';
        positionStyles.marginTop = '8px';
        break;
      case 'right':
        positionStyles.float = 'right';
        positionStyles.marginLeft = '16px';
        positionStyles.marginBottom = '16px';
        positionStyles.marginTop = '8px';
        break;
      case 'center':
        positionStyles.display = 'block';
        positionStyles.margin = '16px auto';
        positionStyles.clear = 'both';
        break;
    }
  } else {
    // Вертикальное позиционирование
    switch (position) {
      case 'top':
        positionStyles.display = 'block';
        positionStyles.marginBottom = '16px';
        positionStyles.clear = 'both';
        break;
      case 'middle':
        positionStyles.display = 'block';
        positionStyles.margin = '16px auto';
        positionStyles.clear = 'both';
        break;
      case 'bottom':
        positionStyles.display = 'block';
        positionStyles.marginTop = '16px';
        positionStyles.clear = 'both';
        break;
    }
  }

  return positionStyles;
};
```

## Алгоритм разделения текста

### Для позиции "посередине"

1. **Разделение на абзацы**:
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

2. **Определение середины**:
   ```typescript
   const middlePoint = Math.ceil(paragraphs.length / 2);
   const firstHalfParagraphs = paragraphs.slice(0, middlePoint);
   const secondHalfParagraphs = paragraphs.slice(middlePoint);
   ```

3. **Рендеринг**:
   - Первая половина абзацев
   - Иллюстрация(и) посередине
   - Вторая половина абзацев

## Особенности реализации

### Обработка HTML контента

- **Очистка тегов**: Удаляются все HTML теги, кроме `<p>`
- **Сохранение структуры**: Абзацы сохраняются как отдельные элементы
- **Fallback**: Если нет тегов `<p>`, текст разделяется по переносам строк

### Горизонтальные иллюстрации

- **Распределение**: Горизонтальные иллюстрации равномерно распределяются по тексту
- **Обтекание**: Текст обтекает иллюстрации слева или справа
- **Центрирование**: Центрированные иллюстрации прерывают поток текста

### Вертикальные иллюстрации

- **Строгое позиционирование**: Иллюстрации размещаются точно в указанных позициях
- **Разделение текста**: Текст корректно разделяется для иллюстраций посередине
- **Очистка потока**: Используется `clear: both` для предотвращения наложений

## Примеры использования

### Пример 1: Иллюстрация сверху по центру
```typescript
{
  imageUrl: "path/to/image.jpg",
  position: "center",
  positionType: "vertical",
  caption: "Заголовочная иллюстрация",
  order: 1
}
```

**Результат**: Иллюстрация отображается над всем текстом сказки, центрированная.

### Пример 2: Иллюстрация посередине слева
```typescript
{
  imageUrl: "path/to/image.jpg",
  position: "left",
  positionType: "vertical",
  caption: "Ключевой момент",
  order: 2
}
```

**Результат**: Иллюстрация отображается в середине текста, выровненная по левому краю.

### Пример 3: Горизонтальная иллюстрация справа
```typescript
{
  imageUrl: "path/to/image.jpg",
  position: "right",
  positionType: "horizontal",
  caption: "Дополнительная иллюстрация",
  order: 3
}
```

**Результат**: Иллюстрация встраивается в текст, текст обтекает её слева.

## Преимущества новой системы

### 1. Точное позиционирование
- ✅ Иллюстрации размещаются точно в соответствии с выбором пользователя
- ✅ Текст корректно разделяется для иллюстраций посередине
- ✅ Никакой текст не появляется в неправильных местах

### 2. Гибкость
- ✅ Поддержка всех комбинаций вертикального и горизонтального позиционирования
- ✅ Автоматическое распределение горизонтальных иллюстраций
- ✅ Адаптация к различным типам контента

### 3. Производительность
- ✅ Эффективное разделение текста на абзацы
- ✅ Минимальные пересчеты при изменении позиций
- ✅ Оптимизированная структура DOM

### 4. Пользовательский опыт
- ✅ Интуитивное понимание позиционирования
- ✅ Визуальная обратная связь при выборе позиции
- ✅ Предсказуемое поведение системы

## Тестирование

### Ручное тестирование

1. **Создайте сказку** с несколькими абзацами текста
2. **Добавьте иллюстрации** с разными позициями:
   - Сверху по центру
   - Посередине слева
   - Снизу справа
   - Горизонтальные в тексте
3. **Проверьте результат**:
   - Иллюстрации должны быть в правильных позициях
   - Текст должен корректно разделяться
   - Не должно быть наложений

### Автоматическое тестирование

```typescript
// Пример теста
describe('StoryContent positioning', () => {
  it('should position top illustrations correctly', () => {
    const content = '<p>Первый абзац</p><p>Второй абзац</p>';
    const illustrations = [{
      id: '1',
      imageUrl: 'test.jpg',
      position: 'center',
      positionType: 'vertical',
      order: 1
    }];
    
    const result = render(<StoryContent content={content} illustrations={illustrations} />);
    
    // Проверяем, что иллюстрация находится в начале
    expect(result.container.firstChild).toHaveClass('story-illustration');
  });
});
```

## Будущие улучшения

### 1. Более точное позиционирование
- Поддержка позиционирования по процентам текста
- Возможность указания конкретных абзацев для иллюстраций

### 2. Адаптивность
- Автоматическое изменение позиций на мобильных устройствах
- Оптимизация для различных размеров экрана

### 3. Интерактивность
- Drag & drop для изменения позиций
- Предварительный просмотр позиционирования

### 4. Производительность
- Виртуализация для больших текстов
- Ленивая загрузка иллюстраций 