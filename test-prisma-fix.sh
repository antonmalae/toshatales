#!/bin/bash

echo "🔧 Тестирование исправления Prisma OpenSSL..."

# Останавливаем существующие контейнеры
echo "📦 Останавливаем существующие контейнеры..."
docker-compose down

# Удаляем старые образы для чистого пересборки
echo "🗑️ Удаляем старые образы backend..."
docker rmi tosha-tales-backend_backend 2>/dev/null || true

# Пересобираем контейнеры
echo "🔨 Пересобираем контейнеры..."
docker-compose build --no-cache backend

# Запускаем только backend для тестирования
echo "🚀 Запускаем backend контейнер..."
docker-compose up -d postgres
sleep 10  # Ждем запуска PostgreSQL

# Запускаем backend
docker-compose up backend

echo "✅ Тестирование завершено. Проверьте логи на наличие ошибок Prisma."
