#!/bin/bash

echo "🚀 Начинаем деплой Сказок про Крокодила Тоши..."

# Функция для проверки статуса Docker
check_docker_status() {
    if ! docker info &> /dev/null; then
        echo "❌ Docker daemon недоступен. Пытаемся исправить..."
        
        # Пытаемся запустить Docker service
        if command -v systemctl &> /dev/null; then
            echo "🔄 Запускаем Docker service..."
            sudo systemctl start docker
            sleep 3
            
            if ! docker info &> /dev/null; then
                echo "❌ Не удалось запустить Docker service"
                echo "🔧 Попробуйте выполнить: sudo systemctl start docker"
                exit 1
            fi
        else
            echo "❌ systemctl недоступен. Запустите Docker вручную"
            exit 1
        fi
    fi
    
    echo "✅ Docker daemon доступен"
}

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и Docker Compose"
    echo "📖 Инструкция по установке: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose"
    echo "📖 Инструкция по установке: https://docs.docker.com/compose/install/"
    exit 1
fi

# Проверяем статус Docker daemon
check_docker_status

# Проверяем права пользователя
if ! docker ps &> /dev/null; then
    echo "⚠️  Текущий пользователь не может выполнять Docker команды"
    echo "🔧 Добавляем пользователя в группу docker..."
    sudo usermod -aG docker $USER
    echo "✅ Пользователь добавлен в группу docker"
    echo "🔄 Перезапустите терминал или выполните: newgrp docker"
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
DOMAIN=tosha-tales.ru
EOF
    echo "⚠️  Создан .env файл с дефолтными значениями. Измените пароли для production!"
fi

# Проверяем SSL сертификаты для production
if [ ! -d "./ssl" ]; then
    echo "📁 Создаем директорию для SSL сертификатов..."
    mkdir -p ssl
    echo "⚠️  Поместите SSL сертификаты в папку ./ssl/"
    echo "   - tosha-tales.ru.crt (сертификат)"
    echo "   - tosha-tales.ru.key (приватный ключ)"
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
if [ "$1" = "--production" ]; then
    echo "🚀 Запускаем в production режиме с Nginx..."
    docker-compose --profile production up -d --build
else
    echo "🔧 Запускаем в development режиме..."
    docker-compose up -d --build
fi

# Проверяем успешность запуска
if [ $? -ne 0 ]; then
    echo "❌ Ошибка при запуске контейнеров"
    echo "📋 Логи последнего контейнера:"
    docker-compose logs --tail=50
    exit 1
fi

# Ждем запуска базы данных
echo "⏳ Ждем запуска базы данных..."
sleep 15

# Проверяем статус базы данных
echo "🔍 Проверяем статус базы данных..."
if ! docker-compose exec -T postgres pg_isready -U tosha_user -d tosha_tales &> /dev/null; then
    echo "❌ База данных не готова. Ждем еще..."
    sleep 10
    
    if ! docker-compose exec -T postgres pg_isready -U tosha_user -d tosha_tales &> /dev/null; then
        echo "❌ База данных все еще не готова"
        echo "📋 Логи базы данных:"
        docker-compose logs postgres
        exit 1
    fi
fi

echo "✅ База данных готова"

# Применяем миграции
echo "🗄️  Применяем миграции базы данных..."
if ! docker-compose exec -T backend npx prisma migrate deploy; then
    echo "❌ Ошибка при применении миграций"
    echo "📋 Логи backend:"
    docker-compose logs backend
    exit 1
fi

# Проверяем статус
echo "✅ Проверяем статус сервисов..."
docker-compose ps

# Проверяем доступность сервисов
echo "🔍 Проверяем доступность сервисов..."

# Проверяем backend
if curl -f http://localhost:3001/health &> /dev/null; then
    echo "✅ Backend API доступен"
else
    echo "❌ Backend API недоступен"
fi

# Проверяем frontend
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend доступен"
else
    echo "❌ Frontend недоступен"
fi

echo ""
echo "🎉 Деплой завершен!"
echo ""
echo "📱 Frontend: https://tosha-tales.ru"
echo "🔧 Backend API: https://tosha-tales.ru/api"
echo "🗄️  База данных: localhost:5432"
echo ""
echo "📋 Полезные команды:"
echo "  docker-compose logs -f          # Просмотр логов"
echo "  docker-compose down             # Остановить все"
echo "  docker-compose restart backend  # Перезапустить backend"
echo "  docker-compose exec postgres psql -U tosha_user -d tosha_tales  # Подключиться к БД"
echo ""
echo "🚀 Для production деплоя:"
echo "  ./deploy.sh --production       # Запуск с Nginx и SSL"
echo "  ./deploy.sh --clean            # Полная очистка и пересборка"
echo ""
echo "⚠️  Не забудьте изменить пароли в .env файле для production!"
echo "⚠️  Поместите SSL сертификаты в папку ./ssl/ для HTTPS"
