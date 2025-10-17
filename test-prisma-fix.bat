@echo off
echo 🔧 Тестирование исправления Prisma OpenSSL...

REM Останавливаем существующие контейнеры
echo 📦 Останавливаем существующие контейнеры...
docker-compose down

REM Удаляем старые образы для чистого пересборки
echo 🗑️ Удаляем старые образы backend...
docker rmi tosha-tales-backend_backend 2>nul

REM Пересобираем контейнеры
echo 🔨 Пересобираем контейнеры...
docker-compose build --no-cache backend

REM Запускаем только backend для тестирования
echo 🚀 Запускаем backend контейнер...
docker-compose up -d postgres
timeout /t 10 /nobreak >nul

REM Запускаем backend
docker-compose up backend

echo ✅ Тестирование завершено. Проверьте логи на наличие ошибок Prisma.
pause
