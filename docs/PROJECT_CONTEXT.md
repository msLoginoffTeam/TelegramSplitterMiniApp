# Telegram Splitter Mini App — контекст

Обновлено: 2026-08-02.

## Репозиторий

- GitHub: <https://github.com/msLoginoffTeam/TelegramSplitterMiniApp>
- Локальная каноническая копия: `/Users/max/RiderProjects/TelegramSplitterMiniApp`
- Backend: <https://github.com/msLoginoffTeam/TelegramSplitter>
- Bot adapter: <https://github.com/msLoginoffTeam/tg_splitter_adapter>

Frontend вынесен в отдельный репозиторий осознанно: независимая история, CI, README/демо и отдельное представление проекта на GitHub.

## Цель

Красивый, минималистичный и понятный Telegram Mini App для совместных расходов:

- список групп и персональный итог «я должен / мне должны»;
- dashboard группы с последними операциями;
- создание траты: сумма, название, плательщик, участники и split;
- прямые и привязанные к трате платежи;
- итоговые transfers «кто → кому → сколько»;
- участники, приглашения и настройки группы.

## Архитектурные решения

- React + TypeScript; Vite как рекомендуемая основа.
- Server state через TanStack Query.
- Типы и API methods/hooks генерируются из backend OpenAPI; ручные копии DTO не поддерживаются.
- Приложение должно работать как Telegram Mini App и как обычное локальное web-приложение с dev-auth adapter.
- Telegram `initData` всегда валидируется backend; данные клиента не считаются авторизацией.
- Тема Telegram, safe areas, Back/Main Button и haptics оборачиваются в отдельный platform adapter, чтобы не размазывать Telegram API по UI.

## Контракт с backend

- Backend остаётся источником истины для пользователей, membership, денег, балансов и transfers.
- Frontend хранит формы и временный UI state, но не дублирует расчёт долгов.
- Генератор API должен запускаться одной командой из OpenAPI snapshot или локального Swagger endpoint.
- CI должен обнаруживать незакоммиченный drift сгенерированного клиента.

## Ближайшие шаги

1. Согласовать frontend foundation: package manager, UI primitives, routing, forms/validation и test stack.
2. Создать React/Vite scaffold и Telegram/local environment adapter.
3. Подключить OpenAPI generation и TanStack Query.
4. Сделать navigable UX skeleton на mock data.
5. После backend auth подключить реальные группы, траты, платежи и transfers.

## Навигация по знаниям

- Этот файл — frontend architecture и принятые решения.
- `docs/KNOWN_ISSUES.md` — frontend/integration backlog.
- Backend context локально: `/Users/max/RiderProjects/BudgetSplitterWebApi/docs/PROJECT_CONTEXT.md`.
