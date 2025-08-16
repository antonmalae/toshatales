# 🚀 Деплой Сказок про Крокодила Тоши

## 🐳 Простой деплой через Docker

### Быстрый старт (локально)

1. **Установите Docker и Docker Compose**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo systemctl start docker
   sudo systemctl enable docker
   
   # Добавьте пользователя в группу docker
   sudo usermod -aG docker $USER
   # Перезайдите в систему
   ```

2. **Клонируйте проект**
   ```bash
   git clone https://github.com/ваш-username/tosha-tales.git
   cd tosha-tales
   ```

3. **Запустите деплой**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **Откройте в браузере**
   - Frontend: http://localhost
   - Backend API: http://localhost:3001

### 🖥️ Деплой на VPS сервер

1. **Подключитесь к VPS**
   ```bash
   ssh user@ваш-vps-ip
   ```

2. **Установите Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   # Перезайдите в систему
   ```

3. **Установите Docker Compose**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Клонируйте и запустите проект**
   ```bash
   git clone https://github.com/ваш-username/tosha-tales.git
   cd tosha-tales
   chmod +x deploy.sh
   ./deploy.sh
   ```

### 🔧 Настройка для production

1. **Создайте .env файл**
   ```bash
   cp .env.example .env
   nano .env
   ```

2. **Измените пароли**
   ```env
   DB_PASSWORD=ваш_надежный_пароль_для_базы_данных
   JWT_SECRET=ваш_очень_надежный_jwt_секрет_минимум_32_символа
   DOMAIN=ваш-домен.com
   ```

3. **Настройте домен**
   - Укажите IP вашего VPS в DNS записях домена
   - Измените DOMAIN в .env файле

4. **Запустите с production профилем**
   ```bash
   docker-compose --profile production up -d
   ```

### 📋 Полезные команды

```bash
# Просмотр логов
docker-compose logs -f

# Остановить все сервисы
docker-compose down

# Перезапустить backend
docker-compose restart backend

# Обновить приложение
git pull
./deploy.sh

# Подключиться к базе данных
docker-compose exec postgres psql -U tosha_user -d tosha_tales

# Просмотр статуса
docker-compose ps

# Очистка (удаляет все образы и данные)
./deploy.sh --clean
```

### 🔒 Безопасность

- ✅ Измените все пароли по умолчанию
- ✅ Используйте сложный JWT_SECRET
- ✅ Настройте firewall на VPS
- ✅ Регулярно обновляйте Docker образы
- ✅ Делайте бэкапы базы данных

### 🆘 Решение проблем

**Проблема**: Контейнеры не запускаются
```bash
# Проверьте логи
docker-compose logs

# Проверьте статус
docker-compose ps

# Перезапустите
docker-compose down && docker-compose up -d
```

**Проблема**: База данных не подключается
```bash
# Проверьте статус PostgreSQL
docker-compose exec postgres pg_isready -U tosha_user

# Примените миграции вручную
docker-compose exec backend npx prisma migrate deploy
```

**Проблема**: Frontend не отображается
```bash
# Проверьте nginx логи
docker-compose logs frontend

# Пересоберите frontend
docker-compose build frontend
docker-compose up -d frontend
```

### 🎯 Что происходит при деплое

1. **PostgreSQL** - запускается база данных
2. **Backend** - собирается и запускается Node.js API
3. **Frontend** - собирается React приложение и запускается через nginx
4. **Миграции** - автоматически применяются к базе данных
5. **Проверки** - проверяется здоровье всех сервисов

### 🚀 Готово!

Теперь у вас есть полностью автоматизированный деплой через Docker! Просто запустите `./deploy.sh` и все заработает.
