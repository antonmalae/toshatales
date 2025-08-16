#!/bin/bash

echo "🚀 Начинаем деплой Сказок про Крокодила Тоши..."

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и Docker Compose"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose"
    exit 1
fi

# Создаем .env файл если его нет
if [ ! -f .env ]; then
    echo "📝 Создаем .env файл..."
    cat > .env << EOF
# База данных
DB_PASSWORD=tosha_password_2024

# JWT секрет (минимум 32 символа)
JWT_SECRET=your_super_secret_jwt_key_2024_change_this_in_production

# Домен (для production)
DOMAIN=localhost
EOF
    echo "⚠️  Создан .env файл с дефолтными значениями. Измените пароли для production!"
fi

# Останавливаем существующие контейнеры
echo "🛑 Останавливаем существующие контейнеры..."
docker-compose down

# Удаляем старые образы (опционально)
if [ "$1" = "--clean" ]; then
    echo "🧹 Очищаем старые образы..."
    docker-compose down --rmi all --volumes --remove-orphans
fi

# Собираем и запускаем
echo "🔨 Собираем и запускаем контейнеры..."
docker-compose up -d --build

# Ждем запуска базы данных
echo "⏳ Ждем запуска базы данных..."
sleep 10

# Применяем миграции
echo "🗄️  Применяем миграции базы данных..."
docker-compose exec backend npx prisma migrate deploy

# Проверяем статус
echo "✅ Проверяем статус сервисов..."
docker-compose ps

echo ""
echo "🎉 Деплой завершен!"
echo ""
echo "📱 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:3001"
echo "🗄️  База данных: localhost:5432"
echo ""
echo "📋 Полезные команды:"
echo "  docker-compose logs -f          # Просмотр логов"
echo "  docker-compose down             # Остановить все"
echo "  docker-compose restart backend  # Перезапустить backend"
echo "  docker-compose exec postgres psql -U tosha_user -d tosha_tales  # Подключиться к БД"
echo ""
echo "⚠️  Не забудьте изменить пароли в .env файле для production!"
