# Telegram Splitter Mini App

Frontend for a Telegram Mini App that tracks shared expenses, payments, balances and optimized settlement transfers.

## Status

Foundation реализован: platform adapters, generated API contract, quality gates и production-like Docker image готовы. Product UI пока не реализован.

## Stack

- React 19 + TypeScript 7 + Vite 8
- TanStack Query
- OpenAPI-generated API client
- Telegram Mini Apps SDK integration
- Docker image для локального интеграционного запуска

## Первый локальный запуск

Проект фиксирует Yarn 4 через Corepack, поэтому глобальный Yarn 1 использовать нельзя. Один раз на машине выполните:

```bash
corepack enable
yarn install --immutable
yarn dev
```

Для JetBrains IDE после `corepack enable` перезапустите IDE. Yarn executable должен указывать на Corepack shim (на текущем Mac — `/opt/homebrew/bin/yarn`), а не на отдельную установку Yarn 1.

## Локальный Docker stack

Из корня frontend-репозитория запустите:

```bash
docker compose up --build
```

Mini App будет доступен на <http://localhost:5173>. Это независимый web-only Compose; продуктовые запросы `/api/*` проксируются в `API_UPSTREAM`, по умолчанию `http://host.docker.internal:5050`. Для локального API из Rider сначала поднимите только БД командой `docker compose up -d db` в backend-репозитории, затем запустите API из IDE.

Скопируйте `.env.example` в `.env`, если нужны другие адреса или порты. Для production используется отдельный `compose.production.yml`: API остаётся во внутренней Docker-сети, а Mini App публикуется через Tailscale Funnel. Инструкции для Windows-host и CD: [`docs/DEPLOYMENT_WINDOWS.md`](docs/DEPLOYMENT_WINDOWS.md).

## Related repositories

- Backend: <https://github.com/msLoginoffTeam/TelegramSplitter>
- Telegram bot adapter: <https://github.com/msLoginoffTeam/tg_splitter_adapter>

## Project knowledge

- `docs/PROJECT_CONTEXT.md` — frontend scope, architecture and next steps.
- `docs/KNOWN_ISSUES.md` — frontend-specific risks and unresolved decisions.
- `AGENTS.md` — guidance for future Codex sessions.
- `docs/DEPLOYMENT_WINDOWS.md` — production deployment на Windows через Tailscale Funnel и GitHub Actions.
