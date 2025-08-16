# Реализация системы метрик в административной панели

## Обзор

Система метрик была реализована для отображения реальных количественных данных в административной панели вместо заглушек.

## Компоненты системы

### 1. Backend (Node.js + Express + Prisma)

#### Контроллер статистики (`statisticsController.js`)
- `getDashboardStats()` - общая статистика дашборда
- `getStoriesCount()` - количество сказок
- `getCharactersCount()` - количество персонажей
- `getCategoriesCount()` - количество категорий
- `getRolesCount()` - количество ролей
- `getMediaCount()` - количество медиафайлов

#### Маршруты (`statistics.js`)
- `GET /api/admin/statistics` - общая статистика
- `GET /api/admin/statistics/stories` - количество сказок
- `GET /api/admin/statistics/characters` - количество персонажей
- `GET /api/admin/statistics/categories` - количество категорий
- `GET /api/admin/statistics/roles` - количество ролей
- `GET /api/admin/statistics/media` - количество медиафайлов

### 2. Frontend (React + TypeScript)

#### Сервисы
- `statisticsService.js` - API клиент для получения метрик
- `useMetrics.ts` - хук для управления метриками
- `useLiveMetrics.ts` - хук для автоматического обновления метрик

#### Компоненты
- `MetricsCard.tsx` - карточка для отображения метрики
- `AdminSectionCard.tsx` - карточка секции админки с метриками
- `MetricsNotification.tsx` - уведомления об изменениях метрик

## Функциональность

### 1. Реальные данные
- Все метрики получаются из базы данных через API
- Удалены заглушки и статические значения
- Поддержка всех основных сущностей: сказки, персонажи, категории, роли, медиа

### 2. Автоматическое обновление
- Метрики обновляются каждые 30 секунд автоматически
- Возможность включения/отключения автообновления
- Ручное обновление по кнопке

### 3. Уведомления об изменениях
- Отображение изменений метрик в реальном времени
- Визуальные индикаторы роста/уменьшения
- Возможность закрытия уведомлений

### 4. Адаптивность
- Метрики скрываются для несуществующих сущностей
- Graceful handling ошибок API
- Fallback значения при недоступности сервера

## Структура данных

### Метрики
```typescript
interface Metrics {
  stories: number;
  characters: number;
  categories: number;
  roles: number;
  media: number;
}
```

### API ответы
```typescript
// Общая статистика
{
  success: true,
  data: {
    stories: { total: number, published: number, draft: number },
    characters: { total: number },
    categories: { total: number },
    roles: { total: number },
    media: { total: number },
    engagement: { totalLikes: number, totalRatings: number, averageRating: number }
  }
}

// Отдельные метрики
{
  success: true,
  data: { count: number }
}
```

## Использование

### В компонентах
```typescript
import { useLiveMetrics } from '@/hooks/useLiveMetrics';

const MyComponent = () => {
  const { metrics, loading, refreshMetrics } = useLiveMetrics({
    autoRefresh: true,
    refreshInterval: 30000
  });
  
  return (
    <div>
      <MetricsCard
        title="Сказки"
        value={metrics.stories}
        icon={BookOpen}
        iconColor="text-blue-500"
        loading={loading}
      />
    </div>
  );
};
```

### Настройка автообновления
```typescript
const { 
  metrics, 
  isAutoRefreshActive,
  pauseAutoRefresh,
  resumeAutoRefresh 
} = useLiveMetrics({
  autoRefresh: true,
  refreshInterval: 30000, // 30 секунд
  onMetricsUpdate: (newMetrics) => {
    console.log('Metrics updated:', newMetrics);
  }
});
```

## Безопасность

- Все эндпоинты статистики требуют аутентификации
- Проверка прав администратора для доступа к метрикам
- Валидация данных на сервере

## Производительность

- Кэширование метрик на клиенте
- Оптимизированные запросы к базе данных
- Минимальное количество API вызовов
- Debounced обновления для предотвращения спама

## Расширение

### Добавление новой метрики

1. **Backend**: Добавить метод в `statisticsController.js`
2. **Frontend**: Обновить интерфейс `Metrics`
3. **API**: Добавить маршрут в `statistics.js`
4. **UI**: Добавить компонент в административную панель

### Пример добавления метрики "пользователи"
```typescript
// Backend
export const getUsersCount = async (req, res, next) => {
  try {
    const count = await prisma.user.count();
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

// Frontend
interface Metrics {
  stories: number;
  characters: number;
  categories: number;
  roles: number;
  media: number;
  users: number; // новая метрика
}
```

## Мониторинг

- Логирование ошибок API
- Отслеживание производительности запросов
- Мониторинг доступности метрик
- Алерты при критических изменениях

## Будущие улучшения

1. **WebSocket поддержка** для real-time обновлений
2. **Графики и диаграммы** для визуализации трендов
3. **Экспорт метрик** в различные форматы
4. **Настраиваемые дашборды** для разных ролей
5. **Исторические данные** для анализа трендов 