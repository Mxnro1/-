## MiApp — Telegram Органайзер Компании

Русскоязычный, мультиарендный (multi-tenant) таск- и календарный органайзер для компаний, команд и отделов. Включает:

- Backend API (Node.js / TypeScript) с PostgreSQL и Redis
- Telegram Bot (тонкий клиент, все действия через API)
- Telegram Mini App (React / TypeScript) с i18n (ru, подготовка en)

### Структура репозитория

- `backend/` — REST API, бизнес-логика, аутентификация и права доступа
- `bot/` — Telegram-бот, работающий только через backend API
- `miniapp/` — Telegram Mini App (frontend)
- `shared/` — общие типы, константы и схемы (по мере необходимости)

### Основные технологии

- Node.js, TypeScript
- PostgreSQL (через Prisma ORM)
- Redis (очередь и планировщик уведомлений)
- React + TypeScript (Telegram Mini App)

### Запуск (будет дополняться)

1. Установить зависимости в подпроектах:
   - `cd backend && npm install`
   - `cd bot && npm install`
   - `cd miniapp && npm install`

2. Настроить переменные окружения в каждом подпроекте (`.env.example` будет добавлен).

3. Применить миграции БД для backend.

