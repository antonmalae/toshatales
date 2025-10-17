#!/bin/bash

# Генерация самоподписанного SSL сертификата для разработки

echo "🔐 Генерация самоподписанного SSL сертификата..."

# Создаем директорию если её нет
mkdir -p ssl

# Генерируем приватный ключ
openssl genrsa -out ssl/private.key 2048

# Генерируем самоподписанный сертификат
openssl req -new -x509 -key ssl/private.key -out ssl/self-signed.crt -days 365 \
    -subj "/C=RU/ST=Moscow/L=Moscow/O=Tosha Tales/OU=IT Department/CN=tosha-tales.ru"

# Копируем как fullchain для совместимости
cp ssl/self-signed.crt ssl/fullchain.pem

echo "✅ Самоподписанный сертификат создан:"
echo "   - ssl/private.key"
echo "   - ssl/self-signed.crt"
echo "   - ssl/fullchain.pem"
echo ""
echo "⚠️  ВНИМАНИЕ: Это самоподписанный сертификат для разработки!"
echo "   Для production используйте настоящий SSL сертификат."
