#!/bin/bash

echo "🔍 Диагностика Docker на VPS..."
echo "=================================="

# Проверяем версию ОС
echo "📋 Информация об ОС:"
if [ -f /etc/os-release ]; then
    source /etc/os-release
    echo "   ОС: $PRETTY_NAME"
    echo "   Версия: $VERSION"
else
    echo "   ОС: $(uname -a)"
fi
echo ""

# Проверяем наличие Docker
echo "🐳 Проверка Docker:"
if command -v docker &> /dev/null; then
    echo "   ✅ Docker установлен: $(docker --version)"
else
    echo "   ❌ Docker не установлен"
    echo "   💡 Установите Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

# Проверяем наличие Docker Compose
echo ""
echo "📦 Проверка Docker Compose:"
if command -v docker-compose &> /dev/null; then
    echo "   ✅ Docker Compose установлен: $(docker-compose --version)"
else
    echo "   ❌ Docker Compose не установлен"
    echo "   💡 Установите Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Проверяем статус Docker service
echo ""
echo "🔧 Проверка Docker Service:"
if command -v systemctl &> /dev/null; then
    if systemctl is-active --quiet docker; then
        echo "   ✅ Docker service запущен"
    else
        echo "   ❌ Docker service не запущен"
        echo "   🔄 Попытка запуска..."
        sudo systemctl start docker
        sleep 3
        
        if systemctl is-active --quiet docker; then
            echo "   ✅ Docker service успешно запущен"
        else
            echo "   ❌ Не удалось запустить Docker service"
            echo "   📋 Статус: $(systemctl status docker --no-pager -l | head -5)"
        fi
    fi
else
    echo "   ⚠️  systemctl недоступен (возможно, не systemd)"
fi

# Проверяем права пользователя
echo ""
echo "👤 Проверка прав пользователя:"
if docker ps &> /dev/null; then
    echo "   ✅ Пользователь может выполнять Docker команды"
else
    echo "   ❌ Пользователь не может выполнять Docker команды"
    echo "   🔧 Добавление пользователя в группу docker..."
    sudo usermod -aG docker $USER
    echo "   ✅ Пользователь добавлен в группу docker"
    echo "   🔄 Перезапустите терминал или выполните: newgrp docker"
fi

# Проверяем Docker daemon
echo ""
echo "🚀 Проверка Docker Daemon:"
if docker info &> /dev/null; then
    echo "   ✅ Docker daemon доступен"
    echo "   📊 Информация о daemon:"
    docker info | grep -E "(Server Version|Operating System|Kernel Version|Total Memory)" | sed 's/^/      /'
else
    echo "   ❌ Docker daemon недоступен"
    echo "   💡 Возможные причины:"
    echo "      - Docker service не запущен"
    echo "      - Проблемы с правами доступа"
    echo "      - Docker daemon не настроен"
fi

# Проверяем доступные образы и контейнеры
echo ""
echo "📦 Проверка образов и контейнеров:"
echo "   🖼️  Доступные образы:"
if docker images &> /dev/null; then
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | head -10
else
    echo "      ❌ Не удалось получить список образов"
fi

echo ""
echo "   📦 Запущенные контейнеры:"
if docker ps &> /dev/null; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "      ❌ Не удалось получить список контейнеров"
fi

# Проверяем сетевые интерфейсы
echo ""
echo "🌐 Проверка сетевых интерфейсов:"
echo "   📡 Docker сети:"
if docker network ls &> /dev/null; then
    docker network ls
else
    echo "      ❌ Не удалось получить список сетей"
fi

# Проверяем volumes
echo ""
echo "💾 Проверка volumes:"
if docker volume ls &> /dev/null; then
    docker volume ls
else
    echo "   ❌ Не удалось получить список volumes"
fi

# Проверяем системные ресурсы
echo ""
echo "💻 Системные ресурсы:"
echo "   🧠 Память:"
free -h | grep -E "(Mem|Swap)" | sed 's/^/      /'

echo ""
echo "   💾 Дисковое пространство:"
df -h | grep -E "(Filesystem|/dev/)" | sed 's/^/      /'

echo ""
echo "   🔥 Загрузка CPU:"
uptime | sed 's/^/      /'

echo ""
echo "=================================="
echo "🔍 Диагностика завершена!"

# Рекомендации
echo ""
echo "💡 Рекомендации:"
if ! docker info &> /dev/null; then
    echo "   1. Запустите Docker service: sudo systemctl start docker"
    echo "   2. Добавьте пользователя в группу docker: sudo usermod -aG docker $USER"
    echo "   3. Перезапустите терминал"
fi

if ! systemctl is-active --quiet docker 2>/dev/null; then
    echo "   4. Настройте автозапуск Docker: sudo systemctl enable docker"
fi

echo "   5. Проверьте firewall: sudo ufw status"
echo "   6. Проверьте логи Docker: sudo journalctl -u docker.service"
