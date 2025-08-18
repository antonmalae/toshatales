FROM node:18-alpine

WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S appuser && adduser -S appuser -G appuser

# Устанавливаем необходимые пакеты для Alpine
RUN apk add --no-cache curl wget

# Копируем package файлы
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости (включая devDependencies для Prisma)
RUN npm ci --no-audit --no-fund --only=production=false

# Копируем исходный код
COPY . .

# Генерируем Prisma клиент
RUN npx prisma generate

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
    CMD curl -f http://localhost:3001/api/health || exit 1

# Запускаем приложение
CMD ["npm", "start"]
