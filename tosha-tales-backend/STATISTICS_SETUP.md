# Настройка системы статистики

## Проблема и решение

### Проблема
Ошибка при запуске backend:
```
SyntaxError: The requested module '../middleware/auth.js' does not provide an export named 'admin'
```

### Решение
Исправлен импорт в файле `src/routes/statistics.js`:
- Заменен `admin` на `authorize('ADMIN')`
- Используется существующий middleware `authorize` вместо несуществующего `admin`

## Исправления

### 1. Маршруты статистики (`src/routes/statistics.js`)
```javascript
// Было:
import { protect, admin } from '../middleware/auth.js';
router.use(admin);

// Стало:
import { protect, authorize } from '../middleware/auth.js';
router.use(authorize('ADMIN'));
```

### 2. Контроллер статистики (`src/controllers/statisticsController.js`)
```javascript
// Исправлено использование правильного имени модели Prisma
// Было:
prisma.media.count()

// Стало:
prisma.mediaFile.count()
```

## Запуск и тестирование

### 1. Запуск backend
```bash
cd tosha-tales-backend
npm start
```

### 2. Проверка API эндпоинтов
```bash
# Общая статистика
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:3001/api/admin/statistics

# Отдельные метрики
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:3001/api/admin/statistics/stories

curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:3001/api/admin/statistics/characters

curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:3001/api/admin/statistics/categories

curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:3001/api/admin/statistics/roles

curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:3001/api/admin/statistics/media
```

### 3. Тестирование с помощью скрипта
```bash
# Обновите токен в файле test-statistics.js
node test-statistics.js
```

## Структура API ответов

### Общая статистика
```json
{
  "success": true,
  "data": {
    "stories": {
      "total": 10,
      "published": 8,
      "draft": 2
    },
    "characters": {
      "total": 15
    },
    "categories": {
      "total": 5
    },
    "roles": {
      "total": 3
    },
    "media": {
      "total": 25
    },
    "engagement": {
      "totalLikes": 150,
      "totalRatings": 75,
      "averageRating": 4.2
    }
  }
}
```

### Отдельные метрики
```json
{
  "success": true,
  "data": {
    "count": 10
  }
}
```

## Требования к аутентификации

Все эндпоинты статистики требуют:
1. **Аутентификации** - валидный JWT токен в заголовке `Authorization: Bearer <token>`
2. **Прав администратора** - пользователь должен иметь роль `ADMIN`

## Возможные ошибки

### 1. 401 Unauthorized
- Отсутствует токен аутентификации
- Невалидный токен

### 2. 403 Forbidden
- Пользователь не имеет роли `ADMIN`

### 3. 500 Internal Server Error
- Ошибка подключения к базе данных
- Ошибка в SQL запросе

## Мониторинг

### Логи backend
```bash
# Просмотр логов в реальном времени
tail -f logs/app.log
```

### Проверка подключения к БД
```bash
# Тест подключения к базе данных
npx prisma db push
```

## Следующие шаги

1. **Запустите backend** и убедитесь, что нет ошибок
2. **Протестируйте API** с помощью curl или Postman
3. **Проверьте frontend** - метрики должны загружаться автоматически
4. **Добавьте тестовые данные** в базу для проверки отображения

## Полезные команды

```bash
# Генерация Prisma клиента
npx prisma generate

# Миграция базы данных
npx prisma migrate dev

# Просмотр данных в базе
npx prisma studio

# Проверка схемы
npx prisma validate
``` 