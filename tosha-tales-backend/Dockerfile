FROM node:18-alpine

WORKDIR /app

# Устанавливаем необходимые пакеты и настраиваем DNS
RUN apk add --no-cache curl && \
    echo "nameserver 8.8.8.8" > /etc/resolv.conf && \
    echo "nameserver 8.8.4.4" >> /etc/resolv.conf && \
    echo "nameserver 1.1.1.1" >> /etc/resolv.conf

# Копируем package файлы
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости с повторными попытками
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --only=production

# Генерируем Prisma клиент с повторными попытками
RUN npx prisma generate --schema=./prisma/schema.prisma

# Копируем исходный код
COPY . .

# Создаем директорию для загрузок
RUN mkdir -p uploads

# Открываем порт
EXPOSE 3001

# Запускаем приложение
CMD ["npm", "start"]
