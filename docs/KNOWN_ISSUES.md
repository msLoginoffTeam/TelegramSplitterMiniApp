# Telegram Splitter Mini App — журнал проблем и решений

Обновлено: 2026-08-02. Статусы: `open`, `planned`, `fixed`, `won't fix`.

| ID     | Приоритет | Статус  | Область       | Проблема / решение                                                                                                                                                                                                                   |
| ------ | --------- | ------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FE-001 | P0        | planned | Foundation    | Foundation утверждён: React 19, Vite 8, TypeScript 7, Yarn 4, Axios, TanStack Query, React Router, FSD-lite и SCSS Modules. Реализация идёт.                                                                                         |
| FE-002 | P0        | open    | Integration   | Backend пока не имеет Telegram `initData` authentication и group authorization; реальную Mini App авторизацию подключать только после исправления backend.                                                                           |
| FE-003 | P1        | open    | API client    | `api:generate` и `api:check` подготовлены, но snapshot/output ещё не сгенерированы: backend не запущен, Docker daemon выключен, а backend startup требует БД. После запуска db+api проверить реальный output и добавить CI drift check. Не менять генератор без согласования. |
| FE-004 | P1        | planned | Environments  | Нужны два platform режима: реальный Telegram и локальный browser/dev mode без подделывания production auth.                                                                                                                          |
| FE-005 | P1        | planned | UX            | До реализации экранов нужен согласованный navigation map и expense creation flow с режимами equal/exact/percentage и контролем остатка.                                                                                              |
| FE-006 | P2        | open    | Docker        | Frontend Dockerfile и связь с backend local Compose пока отсутствуют.                                                                                                                                                                |
| FE-007 | P1        | fixed   | Toolchain     | По запросу пользователя берём актуальный TypeScript 7.0.x и Oxlint вместо `typescript-eslint`, у которого peer range пока ограничен `<6.1`. Oxlint покрывает TypeScript/React lint и no-restricted-imports для архитектурных границ. |
| FE-008 | P1        | planned | React         | React 19 совместим с выбранным стеком. `@telegram-apps/telegram-ui` исключён: его текущие peer dependencies ограничены React 18.                                                                                                     |
| FE-009 | P1        | fixed   | API artifacts | Принято решение коммитить `openapi/backend.json` и `src/shared/api/generated/`; локальная разработка перегенерирует оба артефакта, CI позднее проверяет drift.                                                                       |

Подтверждённые backend-баги ведутся в `/Users/max/RiderProjects/BudgetSplitterWebApi/docs/KNOWN_ISSUES.md` и здесь не дублируются.
