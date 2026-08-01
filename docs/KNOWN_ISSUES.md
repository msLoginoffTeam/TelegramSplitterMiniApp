# Telegram Splitter Mini App — журнал проблем и решений

Обновлено: 2026-08-02. Статусы: `open`, `planned`, `fixed`, `won't fix`.

| ID | Приоритет | Статус | Область | Проблема / решение |
|---|---|---|---|---|
| FE-001 | P0 | planned | Foundation | Foundation утверждён: React 19, Vite 8, TypeScript 6, Yarn 4, Axios, TanStack Query, React Router, FSD-lite и SCSS Modules. Реализация ещё не начата. |
| FE-002 | P0 | open | Integration | Backend пока не имеет Telegram `initData` authentication и group authorization; реальную Mini App авторизацию подключать только после исправления backend. |
| FE-003 | P1 | planned | API client | Выбран `react-query-swagger` с Axios/TanStack Query. Требуется проверить output на реальном backend OpenAPI, настроить regeneration и CI drift check. Не менять генератор без согласования. |
| FE-004 | P1 | planned | Environments | Нужны два platform режима: реальный Telegram и локальный browser/dev mode без подделывания production auth. |
| FE-005 | P1 | planned | UX | До реализации экранов нужен согласованный navigation map и expense creation flow с режимами equal/exact/percentage и контролем остатка. |
| FE-006 | P2 | open | Docker | Frontend Dockerfile и связь с backend local Compose пока отсутствуют. |
| FE-007 | P1 | planned | Toolchain | Не использовать TypeScript 7 до поддержки в `typescript-eslint`; на foundation pin TypeScript 6.0.x. |
| FE-008 | P1 | planned | React | React 19 совместим с выбранным стеком. `@telegram-apps/telegram-ui` исключён: его текущие peer dependencies ограничены React 18. |
| FE-009 | P1 | open | API artifacts | Требуется подтвердить политику: коммитить OpenAPI snapshot и generated client (рекомендуется) либо генерировать их только при build. |

Подтверждённые backend-баги ведутся в `/Users/max/RiderProjects/BudgetSplitterWebApi/docs/KNOWN_ISSUES.md` и здесь не дублируются.
