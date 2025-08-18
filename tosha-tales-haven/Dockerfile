FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --no-audit --no-fund

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Production stage
FROM nginx:bullseye-slim

# Создаем пользователя для безопасности
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Устанавливаем права
RUN chown -R appuser:appuser /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Переключаемся на непривилегированного пользователя
USER appuser

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
