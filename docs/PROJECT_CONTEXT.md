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

- React 19 + TypeScript 7 + Vite 8.
- Yarn 4 через Corepack с `node_modules` linker; версия фиксируется в `packageManager`, `yarn.lock` коммитится.
- Server state через TanStack Query; Redux/Zustand и другой global store не добавляются без доказанной необходимости.
- HTTP через единый Axios instance.
- Типы и TanStack Query hooks генерируются `react-query-swagger` из backend OpenAPI; ручные копии DTO не поддерживаются.
- Актуальный OpenAPI snapshot и deterministic generated client коммитятся в frontend-репозиторий. При локальных изменениях backend они перегенерируются разработчиком; CI позднее проверяет drift.
- React Router в SPA/library mode.
- FSD-lite: `app → pages → widgets → features → entities → shared`, с публичным API slices и контролем импортов.
- Стили: CSS custom properties для динамической темы/токенов и `*.module.scss` для локальных стилей. Без Tailwind, CSS-in-JS и UI kit.
- Формы: React Hook Form + Zod.
- Приложение должно работать как Telegram Mini App и как обычное web-приложение через разные platform adapters.
- Telegram `initData` всегда валидируется backend; данные клиента не считаются авторизацией.
- Тема Telegram, safe areas, Back/Main Button и haptics оборачиваются в отдельный platform adapter, чтобы не размазывать Telegram API по UI.
- Telegram-specific SDK запрещено импортировать из `entities`, `features`, `widgets` и `pages`.
- Compose этого репозитория поднимает только статический frontend через Nginx. `/api` проксируется в настраиваемый `API_UPSTREAM`; backend и PostgreSQL живут в backend-репозитории.
- Полный foundation-план: `docs/FOUNDATION_PLAN.md`.

## Контракт с backend

- Backend остаётся источником истины для пользователей, membership, денег, балансов и transfers.
- Frontend хранит формы и временный UI state, но не дублирует расчёт долгов.
- Генератор API должен запускаться одной командой из OpenAPI snapshot или локального Swagger endpoint.
- CI должен обнаруживать незакоммиченный drift сгенерированного клиента.
- Канонические пути артефактов: `openapi/backend.json` и `src/shared/api/generated/`.

## Ближайшие шаги

1. Foundation реализован в ветке `codex/frontend-foundation`: React/Vite scaffold, platform adapters, Axios boundary, generated API artifacts и quality CI готовы.
2. Согласовать navigation map и сделать navigable UX skeleton на mock data.
3. При появлении первого entity API подключить его к central Axios factory; UI не импортирует generated client напрямую.
4. После backend auth подключить реальные группы, траты, платежи и transfers.

## Навигация по знаниям

- Этот файл — frontend architecture и принятые решения.
- `docs/FOUNDATION_PLAN.md` — подробное задание на ближайший этап.
- `docs/KNOWN_ISSUES.md` — frontend/integration backlog.
- Backend context локально: `/Users/max/RiderProjects/BudgetSplitterWebApi/docs/PROJECT_CONTEXT.md`.
- Локальный запуск и переменные — в корневом `README.md`; backend-сценарий — в `/Users/max/RiderProjects/BudgetSplitterWebApi/docs/LOCAL_DEVELOPMENT.md`.
