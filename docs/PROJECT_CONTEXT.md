# Telegram Splitter Mini App — контекст

Обновлено: 2026-08-09.

## Репозиторий

## Рабочий Git-процесс

- Codex не выполняет `git commit` и `git push` без отдельного явного разрешения пользователя.
- После правок Codex оставляет рабочий diff, проверяет сборку/форматирование и предлагает сообщение для коммита; пользователь сначала проверяет изменения и коммитит их самостоятельно.

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
- UI использует тёмную минималистичную тему: фиолетовый — акцент, зелёный/красный сохраняют денежную семантику. Обычные ссылки не подчёркиваются; подчёркивание не используется как общий стиль интерактивности.
- Формы: React Hook Form + Zod.
- Приложение должно работать как Telegram Mini App и как обычное web-приложение через разные platform adapters.
- Telegram `initData` всегда валидируется backend; данные клиента не считаются авторизацией.
- Тема Telegram, safe areas, Back/Main Button и haptics оборачиваются в отдельный platform adapter, чтобы не размазывать Telegram API по UI.
- Telegram-specific SDK запрещено импортировать из `entities`, `features`, `widgets` и `pages`.
- Compose этого репозитория поднимает только статический frontend через Nginx. `/api` проксируется в настраиваемый `API_UPSTREAM`; backend и PostgreSQL живут в backend-репозитории.
- Production Compose находится в `compose.production.yml`: frontend соединяется с backend по внешней Docker-сети `splitter-internal`, слушает только loopback Windows host, а публичный HTTPS обеспечивает Tailscale Funnel. CD выполняется self-hosted GitHub Actions runner с label `splitter-prod`; подробности — `docs/DEPLOYMENT_WINDOWS.md`.
- Полный foundation-план: `docs/FOUNDATION_PLAN.md`.

## Контракт с backend

- Backend остаётся источником истины для пользователей, membership, денег, балансов и transfers.
- Frontend хранит формы и временный UI state, но не дублирует расчёт долгов.
- Генератор API должен запускаться одной командой из OpenAPI snapshot или локального Swagger endpoint.
- CI должен обнаруживать незакоммиченный drift сгенерированного клиента.
- Канонические пути артефактов: `openapi/backend.json` и `src/shared/api/generated/`.
- У трат и платежей есть необязательный `Description` (до 1000 символов): заметка не влияет на баланс и должна коммититься вместе с backend migration `AddOperationDescriptions` и обновлёнными API-артефактами.
- В деталях траты у каждой непогашенной доли есть вход «Погасить»: он открывает общую форму платежа с предвыбранными тратой, должником и текущим остатком его доли. Все поля формы остаются изменяемыми; остаток вычисляется из платежей, уже привязанных к этой трате.

## Ближайшие шаги

1. Foundation реализован в `main`: React/Vite scaffold, platform adapters, Axios boundary, generated API artifacts и quality CI готовы.
2. Backend handoff завершён: актуальный OpenAPI-контракт включает Telegram authentication, Users API, groups, permissions, траты, платежи и transfers.
3. Навигационный каркас реализован без mock data: `/groups`, создание группы и разделы выбранной группы (траты, платежи, transfers, участники, настройки).
4. Первый live vertical slice реализован: Telegram `initData` передаётся из Axios boundary, browser-mode использует только явный local development ID; список/создание групп, dashboard и mobile-first создание траты используют entity/feature layers.
5. Invite flow реализован: backend хранит SHA-256-хэш многоразового expiring token, сам получает username бота через Telegram `getMe`, а Mini App создаёт ссылку и принимает `startapp=invite_<token>`. Следующие продуктовые срезы — expense CRUD, payments и transfers.

Для browser-mode Vite должен проксировать `/api` на backend, запущенный в `Development` (по умолчанию `http://localhost:5028`). Docker API на `5050` остаётся production-like и сознательно не принимает development identity.

Для теста Mini App через Cloudflare Quick Tunnel в `.env.development.local` указывается точный `VITE_DEV_ALLOWED_HOST` без `https://`; Vite не должен разрешать все внешние hosts.

Telegram Bot API не предоставляет полный список участников чата. Автосинхронизация чата поэтому должна использовать события новых участников/сообщений и доступных администраторов; импорт всех исторических участников через Bot API невозможен.

## Навигация по знаниям

- Этот файл — frontend architecture и принятые решения.
- `docs/FOUNDATION_PLAN.md` — подробное задание на ближайший этап.
- `docs/KNOWN_ISSUES.md` — frontend/integration backlog.
- Backend context локально: `/Users/max/RiderProjects/BudgetSplitterWebApi/docs/PROJECT_CONTEXT.md`.
- Локальный запуск и переменные — в корневом `README.md`; backend-сценарий — в `/Users/max/RiderProjects/BudgetSplitterWebApi/docs/LOCAL_DEVELOPMENT.md`.
