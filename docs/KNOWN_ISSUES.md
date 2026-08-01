# Telegram Splitter Mini App — журнал проблем и решений

Обновлено: 2026-08-02. Статусы: `open`, `planned`, `fixed`, `won't fix`.

| ID | Приоритет | Статус | Область | Проблема / решение |
|---|---|---|---|---|
| FE-001 | P0 | planned | Foundation | React scaffold и package manager ещё не выбраны/созданы. Не добавлять случайный набор библиотек до foundation-решения. |
| FE-002 | P0 | open | Integration | Backend пока не имеет Telegram `initData` authentication и group authorization; реальную Mini App авторизацию подключать только после исправления backend. |
| FE-003 | P1 | planned | API client | Требуется выбрать и настроить OpenAPI → TypeScript/TanStack Query generator, одну команду regeneration и CI drift check. |
| FE-004 | P1 | planned | Environments | Нужны два platform режима: реальный Telegram и локальный browser/dev mode без подделывания production auth. |
| FE-005 | P1 | planned | UX | До реализации экранов нужен согласованный navigation map и expense creation flow с режимами equal/exact/percentage и контролем остатка. |
| FE-006 | P2 | open | Docker | Frontend Dockerfile и связь с backend local Compose пока отсутствуют. |

Подтверждённые backend-баги ведутся в `/Users/max/RiderProjects/BudgetSplitterWebApi/docs/KNOWN_ISSUES.md` и здесь не дублируются.
