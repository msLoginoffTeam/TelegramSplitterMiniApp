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

- React 19 + TypeScript 6 + Vite 8.
- Yarn 4 через Corepack с `node_modules` linker; версия фиксируется в `packageManager`, `yarn.lock` коммитится.
- Server state через TanStack Query; Redux/Zustand и другой global store не добавляются без доказанной необходимости.
- HTTP через единый Axios instance.
- Типы и TanStack Query hooks генерируются `react-query-swagger` из backend OpenAPI; ручные копии DTO не поддерживаются.
- React Router в SPA/library mode.
- FSD-lite: `app → pages → widgets → features → entities → shared`, с публичным API slices и контролем импортов.
- Стили: CSS custom properties для динамической темы/токенов и `*.module.scss` для локальных стилей. Без Tailwind, CSS-in-JS и UI kit.
- Формы: React Hook Form + Zod.
- Приложение должно работать как Telegram Mini App и как обычное web-приложение через разные platform adapters.
- Telegram `initData` всегда валидируется backend; данные клиента не считаются авторизацией.
- Тема Telegram, safe areas, Back/Main Button и haptics оборачиваются в отдельный platform adapter, чтобы не размазывать Telegram API по UI.
- Telegram-specific SDK запрещено импортировать из `entities`, `features`, `widgets` и `pages`.
- Полный foundation-план: `docs/FOUNDATION_PLAN.md`.

## Контракт с backend

- Backend остаётся источником истины для пользователей, membership, денег, балансов и transfers.
- Frontend хранит формы и временный UI state, но не дублирует расчёт долгов.
- Генератор API должен запускаться одной командой из OpenAPI snapshot или локального Swagger endpoint.
- CI должен обнаруживать незакоммиченный drift сгенерированного клиента.

## Ближайшие шаги

1. Выполнить утверждённый `docs/FOUNDATION_PLAN.md` в отдельной feature-ветке.
2. Создать React/Vite scaffold и Telegram/browser platform adapters.
3. Подключить `react-query-swagger`, Axios и TanStack Query.
4. Сделать navigable UX skeleton на mock data.
5. После backend auth подключить реальные группы, траты, платежи и transfers.

## Навигация по знаниям

- Этот файл — frontend architecture и принятые решения.
- `docs/FOUNDATION_PLAN.md` — подробное задание на ближайший этап.
- `docs/KNOWN_ISSUES.md` — frontend/integration backlog.
- Backend context локально: `/Users/max/RiderProjects/BudgetSplitterWebApi/docs/PROJECT_CONTEXT.md`.
