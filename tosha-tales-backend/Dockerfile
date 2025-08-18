FROM node:18-bullseye

WORKDIR /app

# Устанавливаем необходимые пакеты для Ubuntu/Debian
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Копируем package файлы
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Генерируем Prisma клиент
RUN npx prisma generate

# Создаем директорию для загрузок
RUN mkdir -p uploads

# Открываем порт
EXPOSE 3001

# Запускаем приложение
CMD ["npm", "start"]
