# 🚀 Деплой Сказок про Крокодила Тоши на VPS

## 📋 Требования

- VPS с Ubuntu 20.04+ или Debian 11+
- Минимум 2GB RAM
- Минимум 20GB дискового пространства
- SSH доступ с sudo правами

## 🔧 Установка Docker

### Автоматическая установка (рекомендуется)

```bash
# Скачиваем и запускаем официальный скрипт установки Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавляем пользователя в группу docker
sudo usermod -aG docker $USER

# Включаем автозапуск Docker
sudo systemctl enable docker
sudo systemctl start docker

# Перезапускаем терминал или выполняем
newgrp docker
```

### Ручная установка

```bash
# Обновляем пакеты
sudo apt update

# Устанавливаем необходимые пакеты
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Добавляем GPG ключ Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавляем репозиторий Docker
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Устанавливаем Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Устанавливаем Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 🚨 Решение проблем с Docker

### Проблема: Connection refused при выполнении docker команд

Это означает, что Docker daemon не запущен или недоступен.

#### Решение 1: Автоматическое исправление

```bash
# Запускаем скрипт автоматического исправления
chmod +x fix-docker.sh
./fix-docker.sh
```

#### Решение 2: Ручное исправление

```bash
# 1. Проверяем статус Docker service
sudo systemctl status docker

# 2. Запускаем Docker service
sudo systemctl start docker

# 3. Включаем автозапуск
sudo systemctl enable docker

# 4. Проверяем права пользователя
groups $USER

# 5. Если пользователь не в группе docker, добавляем
sudo usermod -aG docker $USER

# 6. Перезапускаем терминал или выполняем
newgrp docker

# 7. Проверяем работу Docker
docker ps
```

### Проблема: Permission denied при выполнении docker команд

```bash
# Добавляем пользователя в группу docker
sudo usermod -aG docker $USER

# Перезапускаем терминал или выполняем
newgrp docker

# Проверяем права на docker.sock
ls -la /var/run/docker.sock

# Если нужно, исправляем права
sudo chown root:docker /var/run/docker.sock
sudo chmod 666 /var/run/docker.sock
```

### Проблема: Firewall блокирует подключения

```bash
# Проверяем статус UFW
sudo ufw status

# Если firewall активен, добавляем необходимые правила
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 3001/tcp  # Backend API

# Или отключаем firewall (не рекомендуется для production)
sudo ufw disable
```

## 🔍 Диагностика проблем

### Запуск диагностики

```bash
# Запускаем полную диагностику Docker
chmod +x docker-diagnostic.sh
./docker-diagnostic.sh
```

### Проверка логов

```bash
# Логи Docker service
sudo journalctl -u docker.service -f

# Логи контейнеров
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend
```

## 🚀 Деплой приложения

### 1. Подготовка

```bash
# Клонируем репозиторий
git clone <your-repo-url>
cd Tales

# Делаем скрипты исполняемыми
chmod +x deploy.sh
chmod +x fix-docker.sh
chmod +x docker-diagnostic.sh
```

### 2. Настройка окружения

```bash
# Создаем .env файл (автоматически создается при деплое)
# Или создаем вручную:
cat > .env << EOF
# База данных
DB_PASSWORD=your_secure_password_here

# JWT секрет (минимум 32 символа)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Домен (для production)
DOMAIN=your-domain.com
EOF
```

### 3. Запуск деплоя

```bash
# Обычный деплой
./deploy.sh

# Деплой с очисткой старых образов
./deploy.sh --clean
```

## 📊 Мониторинг после деплоя

### Проверка статуса сервисов

```bash
# Статус всех контейнеров
docker-compose ps

# Статус конкретного сервиса
docker-compose ps backend
docker-compose ps postgres
docker-compose ps frontend
```

### Проверка доступности

```bash
# Backend API
curl http://localhost:3001/api/health

# Frontend
curl http://localhost

# База данных
docker-compose exec postgres pg_isready -U tosha_user -d tosha_tales
```

### Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend
```

## 🛠️ Полезные команды

### Управление контейнерами

```bash
# Остановить все сервисы
docker-compose down

# Перезапустить конкретный сервис
docker-compose restart backend
docker-compose restart postgres
docker-compose restart frontend

# Пересобрать и запустить
docker-compose up -d --build

# Просмотр использования ресурсов
docker stats
```

### Работа с базой данных

```bash
# Подключение к базе данных
docker-compose exec postgres psql -U tosha_user -d tosha_tales

# Применение миграций
docker-compose exec backend npx prisma migrate deploy

# Сброс базы данных
docker-compose exec backend npx prisma migrate reset

# Создание резервной копии
docker-compose exec postgres pg_dump -U tosha_user tosha_tales > backup.sql
```

### Очистка и обслуживание

```bash
# Удаление неиспользуемых образов
docker image prune -a

# Удаление неиспользуемых volumes
docker volume prune

# Удаление неиспользуемых сетей
docker network prune

# Полная очистка
docker system prune -a --volumes
```

## 🔒 Безопасность для Production

### 1. Изменение паролей

```bash
# Отредактируйте .env файл
nano .env

# Измените следующие значения:
DB_PASSWORD=very_secure_password_here
JWT_SECRET=very_long_random_secret_key_here
DOMAIN=your-actual-domain.com
```

### 2. Настройка SSL

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com

# Автоматическое обновление
sudo crontab -e
# Добавьте строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Настройка Firewall

```bash
# Включаем UFW
sudo ufw enable

# Разрешаем только необходимые порты
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3001/tcp  # Backend API (если нужен внешний доступ)

# Проверяем статус
sudo ufw status
```

## 📞 Поддержка

Если у вас возникли проблемы:

1. **Запустите диагностику**: `./docker-diagnostic.sh`
2. **Попробуйте автоматическое исправление**: `./fix-docker.sh`
3. **Проверьте логи**: `docker-compose logs -f`
4. **Убедитесь, что Docker запущен**: `sudo systemctl status docker`

## 📚 Дополнительные ресурсы

- [Официальная документация Docker](https://docs.docker.com/)
- [Docker Compose документация](https://docs.docker.com/compose/)
- [Ubuntu Docker установка](https://docs.docker.com/engine/install/ubuntu/)
- [Debian Docker установка](https://docs.docker.com/engine/install/debian/)
