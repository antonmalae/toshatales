FROM node:18-alpine

WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S appuser && adduser -S appuser -G appuser

# Устанавливаем необходимые пакеты для Alpine, включая OpenSSL 1.1.x
RUN apk add --no-cache \
    curl \
    wget \
    openssl1.1-compat \
    libssl1.1 \
    libcrypto1.1

# Копируем package файлы
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости (включая devDependencies для Prisma)
RUN npm ci --no-audit --no-fund --only=production=false

# Копируем исходный код
COPY . .

# Устанавливаем переменные окружения для Prisma
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node
ENV PRISMA_QUERY_ENGINE_BINARY=/app/node_modules/.prisma/client/query-engine-linux-musl

# Генерируем Prisma клиент с правильной платформой для Alpine
RUN npx prisma generate --platform linux-musl

# Удаляем devDependencies для production
RUN npm prune --production

# Создаем директорию для загрузок и устанавливаем права
RUN mkdir -p uploads && chown -R appuser:appuser /app

# Переключаемся на непривилегированного пользователя
USER appuser

# Открываем порт
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Запускаем приложение
CMD ["npm", "start"]
