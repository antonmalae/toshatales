#!/bin/bash

echo "🔧 Автоматическое исправление проблем с Docker..."
echo "================================================"

# Проверяем, запущен ли скрипт от root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Не запускайте этот скрипт от root пользователя!"
    echo "💡 Запустите от обычного пользователя с sudo правами"
    exit 1
fi

# Функция для проверки sudo прав
check_sudo() {
    if ! sudo -n true 2>/dev/null; then
        echo "❌ Требуются sudo права для исправления проблем"
        echo "💡 Убедитесь, что ваш пользователь в группе sudo"
        exit 1
    fi
}

check_sudo

echo "✅ Sudo права подтверждены"

# 1. Запускаем Docker service
echo ""
echo "🔧 Шаг 1: Запуск Docker service..."
if command -v systemctl &> /dev/null; then
    if ! systemctl is-active --quiet docker; then
        echo "   🚀 Запускаем Docker service..."
        sudo systemctl start docker
        
        if systemctl is-active --quiet docker; then
            echo "   ✅ Docker service успешно запущен"
        else
            echo "   ❌ Не удалось запустить Docker service"
            echo "   📋 Проверяем статус..."
            sudo systemctl status docker --no-pager -l | head -10
            exit 1
        fi
    else
        echo "   ✅ Docker service уже запущен"
    fi
    
    # Включаем автозапуск
    echo "   🔄 Включаем автозапуск Docker..."
    sudo systemctl enable docker
    echo "   ✅ Docker настроен на автозапуск"
else
    echo "   ⚠️  systemctl недоступен, пропускаем этот шаг"
fi

# 2. Добавляем пользователя в группу docker
echo ""
echo "🔧 Шаг 2: Настройка прав пользователя..."
if ! groups $USER | grep -q docker; then
    echo "   👤 Добавляем пользователя $USER в группу docker..."
    sudo usermod -aG docker $USER
    echo "   ✅ Пользователь добавлен в группу docker"
    echo "   ⚠️  Перезапустите терминал или выполните: newgrp docker"
else
    echo "   ✅ Пользователь уже в группе docker"
fi

# 3. Проверяем и создаем docker.sock если нужно
echo ""
echo "🔧 Шаг 3: Проверка docker.sock..."
if [ ! -S /var/run/docker.sock ]; then
    echo "   ⚠️  docker.sock не найден"
    echo "   🔄 Перезапускаем Docker service..."
    sudo systemctl restart docker
    sleep 3
    
    if [ -S /var/run/docker.sock ]; then
        echo "   ✅ docker.sock создан"
    else
        echo "   ❌ docker.sock все еще не создан"
    fi
else
    echo "   ✅ docker.sock найден"
fi

# 4. Проверяем права на docker.sock
echo ""
echo "🔧 Шаг 4: Проверка прав на docker.sock..."
DOCKER_SOCK_PERMS=$(ls -la /var/run/docker.sock | awk '{print $1, $3, $4}')
echo "   📋 Права на docker.sock: $DOCKER_SOCK_PERMS"

if [ "$(stat -c %G /var/run/docker.sock)" != "docker" ]; then
    echo "   ⚠️  docker.sock принадлежит не группе docker"
    echo "   🔄 Исправляем права..."
    sudo chown root:docker /var/run/docker.sock
    sudo chmod 666 /var/run/docker.sock
    echo "   ✅ Права исправлены"
else
    echo "   ✅ Права на docker.sock корректны"
fi

# 5. Проверяем firewall
echo ""
echo "🔧 Шаг 5: Проверка firewall..."
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status | head -1)
    echo "   📋 UFW статус: $UFW_STATUS"
    
    if echo "$UFW_STATUS" | grep -q "inactive"; then
        echo "   ✅ Firewall отключен"
    else
        echo "   ⚠️  Firewall активен, проверяем правила для Docker..."
        if ! sudo ufw status | grep -q "22/tcp"; then
            echo "   🔄 Добавляем правило для SSH..."
            sudo ufw allow 22/tcp
        fi
        if ! sudo ufw status | grep -q "80/tcp"; then
            echo "   🔄 Добавляем правило для HTTP..."
            sudo ufw allow 80/tcp
        fi
        if ! sudo ufw status | grep -q "3001/tcp"; then
            echo "   🔄 Добавляем правило для Backend API..."
            sudo ufw allow 3001/tcp
        fi
        echo "   ✅ Правила firewall настроены"
    fi
else
    echo "   ⚠️  UFW не найден, пропускаем проверку firewall"
fi

# 6. Проверяем Docker daemon
echo ""
echo "🔧 Шаг 6: Проверка Docker daemon..."
if docker info &> /dev/null; then
    echo "   ✅ Docker daemon доступен"
    echo "   📊 Версия Docker: $(docker --version)"
    echo "   📊 Версия Docker Compose: $(docker-compose --version)"
else
    echo "   ❌ Docker daemon все еще недоступен"
    echo "   🔄 Перезапускаем Docker service..."
    sudo systemctl restart docker
    sleep 5
    
    if docker info &> /dev/null; then
        echo "   ✅ Docker daemon стал доступен после перезапуска"
    else
        echo "   ❌ Docker daemon все еще недоступен"
        echo "   📋 Логи Docker service:"
        sudo journalctl -u docker.service --no-pager -l | tail -20
        exit 1
    fi
fi

# 7. Тестируем базовые Docker команды
echo ""
echo "🔧 Шаг 7: Тестирование Docker команд..."
echo "   🧪 Тест docker ps..."
if docker ps &> /dev/null; then
    echo "   ✅ docker ps работает"
else
    echo "   ❌ docker ps не работает"
    exit 1
fi

echo "   🧪 Тест docker images..."
if docker images &> /dev/null; then
    echo "   ✅ docker images работает"
else
    echo "   ❌ docker images не работает"
    exit 1
fi

echo "   🧪 Тест docker network ls..."
if docker network ls &> /dev/null; then
    echo "   ✅ docker network ls работает"
else
    echo "   ❌ docker network ls не работает"
    exit 1
fi

# 8. Финальная проверка
echo ""
echo "🔧 Шаг 8: Финальная проверка..."
echo "   🧪 Запуск тестового контейнера..."
if docker run --rm hello-world &> /dev/null; then
    echo "   ✅ Тестовый контейнер успешно запущен"
else
    echo "   ❌ Не удалось запустить тестовый контейнер"
    exit 1
fi

echo ""
echo "================================================"
echo "🎉 Все проблемы с Docker исправлены!"
echo ""
echo "💡 Теперь вы можете:"
echo "   1. Запустить деплой: ./deploy.sh"
echo "   2. Проверить статус: docker ps"
echo "   3. Просмотреть логи: sudo journalctl -u docker.service -f"
echo ""
echo "⚠️  Если вы добавили пользователя в группу docker,"
echo "   перезапустите терминал или выполните: newgrp docker"
