# Tosha Tales Backend API

Backend API для проекта "Сказки про Тошу" - платформы детских сказок.

## 🚀 Технологии

- **Node.js** - среда выполнения
- **Express.js** - веб-фреймворк
- **PostgreSQL** - основная база данных
- **Prisma** - ORM для работы с БД
- **Redis** - кэширование и сессии
- **JWT** - аутентификация
- **Joi** - валидация данных
- **Winston** - логирование
- **Multer** - загрузка файлов
- **Cloudinary** - хранение медиафайлов

## 📋 Требования

- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- npm или yarn

## 🛠️ Установка

1. **Клонируйте репозиторий**
   ```bash
   git clone <repository-url>
   cd tosha-tales-backend
   ```

2. **Установите зависимости**
   ```bash
   npm install
   ```

3. **Настройте переменные окружения**
   ```bash
   cp env.example .env
   ```
   
   Отредактируйте `.env` файл:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/tosha_tales_db"
   
   # Redis
   REDIS_URL="redis://localhost:6379"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

4. **Настройте базу данных**
   ```bash
   # Создайте базу данных PostgreSQL
   createdb tosha_tales_db
   
   # Запустите миграции
   npm run db:migrate
   
   # Заполните базу начальными данными
   npm run db:seed
   ```

## 🚀 Запуск

### Разработка
```bash
npm run dev
```

### Продакшн
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/me` - Получить информацию о текущем пользователе
- `POST /api/auth/logout` - Выход из системы

### Сказки
- `GET /api/stories` - Получить список сказок
- `GET /api/stories/:id` - Получить сказку по ID
- `POST /api/stories` - Создать новую сказку (Admin)
- `PUT /api/stories/:id` - Обновить сказку (Admin)
- `DELETE /api/stories/:id` - Удалить сказку (Admin)
- `POST /api/stories/:id/rate` - Оценить сказку
- `POST /api/stories/:id/like` - Лайкнуть/анлайкнуть сказку

### Персонажи
- `GET /api/characters` - Получить список персонажей
- `GET /api/characters/:id` - Получить персонажа по ID
- `POST /api/characters` - Создать персонажа (Admin)
- `PUT /api/characters/:id` - Обновить персонажа (Admin)
- `DELETE /api/characters/:id` - Удалить персонажа (Admin)
- `POST /api/characters/:id/like` - Лайкнуть/анлайкнуть персонажа

### Категории
- `GET /api/categories` - Получить список категорий
- `POST /api/categories` - Создать категорию (Admin)
- `PUT /api/categories/:id` - Обновить категорию (Admin)
- `DELETE /api/categories/:id` - Удалить категорию (Admin)

### Роли
- `GET /api/roles` - Получить список ролей
- `POST /api/roles` - Создать роль (Admin)
- `PUT /api/roles/:id` - Обновить роль (Admin)
- `DELETE /api/roles/:id` - Удалить роль (Admin)

### Медиа
- `POST /api/media/upload` - Загрузить файл (Admin)
- `GET /api/media` - Получить список медиафайлов (Admin)
- `DELETE /api/media/:id` - Удалить медиафайл (Admin)

### Поиск
- `GET /api/search` - Поиск по сказкам и персонажам

## 🔐 Аутентификация

API использует JWT токены для аутентификации. Для защищенных маршрутов добавьте заголовок:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Структура базы данных

### Основные таблицы:
- `users` - Пользователи
- `stories` - Сказки
- `characters` - Персонажи
- `categories` - Категории
- `roles` - Роли персонажей

### Связующие таблицы:
- `story_characters` - Связь сказок и персонажей
- `story_illustrations` - Иллюстрации к сказкам
- `story_audio` - Аудиофайлы сказок
- `story_ratings` - Оценки сказок
- `story_likes` - Лайки сказок
- `character_likes` - Лайки персонажей
- `media_files` - Медиафайлы

## 🧪 Тестирование

```bash
# Запустить тесты
npm test

# Запустить тесты в режиме наблюдения
npm run test:watch
```

## 📝 Логирование

Логи сохраняются в папке `logs/`:
- `error.log` - ошибки
- `combined.log` - все логи

## 🔧 Скрипты

- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка проекта
- `npm run db:migrate` - Запуск миграций
- `npm run db:reset` - Сброс базы данных
- `npm run db:seed` - Заполнение базы данными
- `npm test` - Запуск тестов
- `npm run lint` - Проверка кода
- `npm run lint:fix` - Исправление ошибок линтера

## 👥 Роли пользователей

- **USER** - Обычный пользователь (чтение, лайки, оценки)
- **ADMIN** - Администратор (полный доступ)

## 🚀 Деплой

1. Настройте переменные окружения для продакшна
2. Создайте базу данных PostgreSQL
3. Запустите миграции: `npm run db:migrate`
4. Запустите приложение: `npm start`

## 📞 Поддержка

Для вопросов и предложений создайте issue в репозитории.

## 📄 Лицензия

MIT License 