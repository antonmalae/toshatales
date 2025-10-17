-- Инициализация базы данных для Сказок про Крокодила Тоши
-- Этот файл выполняется при первом запуске PostgreSQL контейнера

-- Создаем стандартного пользователя postgres если его нет
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
        CREATE ROLE postgres WITH LOGIN SUPERUSER CREATEDB CREATEROLE PASSWORD 'postgres';
    END IF;
END
$$;

-- Создаем расширения если их нет
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создаем схему если её нет
CREATE SCHEMA IF NOT EXISTS public;

-- Устанавливаем права
GRANT ALL ON SCHEMA public TO tosha_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO tosha_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO tosha_user;
