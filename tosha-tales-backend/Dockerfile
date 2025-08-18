FROM node:18-bullseye-slim

WORKDIR /app

# Создаем пользователя для безопасности
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Устанавливаем необходимые пакеты для Ubuntu/Debian
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

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
