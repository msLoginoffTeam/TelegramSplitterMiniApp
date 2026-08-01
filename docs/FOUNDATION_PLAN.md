# Frontend foundation — план реализации

Обновлено: 2026-08-02. Статус: approved, открытых foundation-решений нет.

## Цель этапа

Создать чистый, проверяемый фундамент React-приложения, одинаково пригодный для Telegram Mini App и обычного браузера. Этап не включает продуктовые экраны, дизайн-систему и подключение реальной Telegram-аутентификации.

Итог должен запускаться, собираться и тестироваться; Telegram SDK, HTTP, generated API и UI должны иметь явные границы.

## Утверждённые решения

- React 19.2.x, React DOM 19.2.x.
- Vite 8 + `@vitejs/plugin-react`; React Compiler пока не включать.
- TypeScript 7.0.x (текущий stable).
- Node 22; текущий 22.17.0 удовлетворяет Vite 8 (`>=22.12`).
- Yarn 4 через Corepack, `nodeLinker: node-modules`, exact `packageManager`, lockfile в Git.
- TanStack Query v5 для server state.
- Axios как единственный HTTP transport.
- `react-query-swagger` для OpenAPI → TypeScript/Axios/TanStack Query.
- OpenAPI snapshot (`openapi/backend.json`) и generated client (`src/shared/api/generated/`) коммитятся в Git и перегенерируются локально при изменениях backend-контракта.
- React Router в SPA/library mode.
- React Hook Form + Zod для форм и validation schemas.
- FSD-lite для структуры и направления зависимостей.
- CSS custom properties + SCSS Modules. Без Tailwind, CSS-in-JS и UI kit.
- Vitest + React Testing Library; MSW добавить при появлении API/browser mocks.
- Никакого Redux/Zustand до появления конкретного состояния, которое нельзя нормально разместить в Query, URL, form или component state.

## Проверка React 19

На 2026-08-02 React 19 поддерживают выбранные зависимости:

- `react-query-swagger` 15.13.x: peer React 17/18/19 и TanStack Query `>4`;
- `@tanstack/react-query` 5.x: React 18/19;
- `@tma.js/sdk-react` 3.x: React 17/18/19;
- React Router 7.x: React `>=18`;
- React Hook Form 7.x и Testing Library 16.x: React 19.

Известный конфликт — `@telegram-apps/telegram-ui`, ограниченный React 18. Библиотека не входит в foundation. Риск React 19 оценивается как низкий.

## Целевая структура

```text
src/
  app/
    providers/
    router/
    styles/
    App.tsx
  pages/
  widgets/
  features/
  entities/
  shared/
    api/
      generated/
      http/
    config/
    lib/
    platform/
      browser/
      telegram/
      types.ts
    ui/
  test/
```

Правила:

- верхний слой может импортировать нижний, обратные импорты запрещены;
- slice предоставляет публичный API через `index.ts`, внутренние файлы снаружи не импортируются;
- `shared` не знает о `entities/features/pages`;
- generated code не редактируется вручную;
- UI не импортирует generated client напрямую: доступ к нему идёт через `entity/feature api`;
- React-компоненты не содержат расчёт долей/денег: чистые функции и schemas лежат в `model/lib`;
- Telegram SDK импортируется только в `shared/platform/telegram` и bootstrap/provider-коде.

Не создавать пустые folders заранее «на будущее»: добавлять slice/layer при появлении первого реального файла, кроме foundation directories, необходимых для bootstrap.

## Shared и будущая web-версия

Отдельный shared package пока не создаётся. Повторное использование достигается границами внутри одного приложения:

- `entities/features/shared/ui` не зависят от Telegram;
- platform interface предоставляет theme, viewport, back/main buttons, haptics и auth payload;
- `TelegramPlatform` реализует interface через `@tma.js/sdk-react`;
- `BrowserPlatform` даёт безопасные defaults для обычного web/local режима;
- выбор adapter происходит в `app` bootstrap;
- Axios получает auth через внедрённый provider/callback и не импортирует Telegram SDK.

Если позже понадобится отдельный web bundle, он использует те же pages/features/entities и другой app bootstrap. Выносить workspace/packages заранее не нужно.

## Styling strategy

```text
src/app/styles/
  index.scss        # entry
  reset.scss
  tokens.scss       # CSS custom properties
  typography.scss
  mixins.scss       # только действительно повторяемые mixins
```

- компонентные стили: `Component.module.scss` рядом с компонентом;
- Telegram theme и browser theme выражаются CSS variables;
- Sass использовать через `@use`/`@forward`, не deprecated `@import`;
- Sass variables допустимы только для compile-time helpers, динамические цвета/spacing — CSS variables;
- не использовать глубокую вложенность и глобальные feature-классы;
- `classnames`/`clsx` добавлять только при первом реальном условном composition use case.

SCSS Modules остаётся современным и низкорисковым вариантом. Vanilla Extract/CSS-in-JS/Tailwind добавили бы новый abstraction/build layer без пользы для текущего продукта.

## Последовательность выполнения

### 1. Ветка и toolchain

- Убедиться, что `main` clean и совпадает с `origin/main`.
- Создать `codex/frontend-foundation`.
- Активировать и зафиксировать Yarn 4 через Corepack.
- Добавить `.yarnrc.yml` с `nodeLinker: node-modules`.
- Зафиксировать Node requirement в `engines` и `.nvmrc`/`.node-version`.
- Инициализировать Vite React TypeScript без npm/pnpm artifacts.

Проверка: присутствует один `yarn.lock`; отсутствуют `package-lock.json`, `pnpm-lock.yaml`, PnP artifacts и случайные template assets.

### 2. Dependencies и scripts

Runtime минимум:

- `react`, `react-dom`;
- `react-router-dom`;
- `@tanstack/react-query`;
- `axios`;
- `@tma.js/sdk-react`;
- `react-hook-form`, `@hookform/resolvers`, `zod`;
- `sass`.

Dev минимум:

- Vite/plugin React, TypeScript 6;
- Oxlint с нативными TypeScript/React правилами; выбран вместо `typescript-eslint`, который пока не поддерживает TypeScript 7.
- Prettier;
- Vitest, jsdom, React Testing Library, user-event.

Обязательные scripts:

- `dev`, `build`, `preview`;
- `typecheck`, `lint`, `lint:fix`, `format`, `format:check`;
- `test`, `test:watch`;
- `api:generate`, позднее `api:check`.

Не ставить libraries «на всякий случай».

### 3. Git ignore audit

Проверить/добавить ignore для:

- `node_modules`, `dist`, `.vite`, coverage;
- `.env`, `.env.*`, кроме `.env.example`;
- `.DS_Store`, IDE local state;
- Yarn install/cache/unplugged state, который не нужен при global cache + node-modules linker;
- TypeScript build info;
- Playwright reports/test results, когда Playwright появится;
- локальные HTTPS certificates и temporary OpenAPI downloads.

Не игнорировать:

- `yarn.lock`, `.yarnrc.yml`, `package.json`;
- source SCSS/TypeScript;
- `AGENTS.md` и `docs/`;
- `openapi/backend.json` и `src/shared/api/generated/` — это коммитящиеся воспроизводимые артефакты, а не ignore targets.

После scaffold обязательно проверить `git status --ignored` и убедиться, что secrets/build/cache не попадут в commit.

### 4. App bootstrap и FSD boundaries

- Создать QueryClient provider с консервативными defaults; не настраивать агрессивные retries/refetch без сценария.
- Создать Router provider и минимальные routes: shell + not-found.
- Добавить error boundary на уровне app.
- Добавить platform provider/interface.
- Настроить aliases и ESLint `no-restricted-imports` для направления слоёв.
- Не создавать product entities/features на этом шаге.

### 5. Telegram/browser platform

- Инкапсулировать `@tma.js/sdk-react` в Telegram adapter.
- Реализовать initialization/ready, theme binding, safe areas, viewport и Back Button lifecycle.
- Каждый Telegram capability вызывать только после availability/support check.
- Инициализация должна быть идемпотентной под React StrictMode.
- Browser adapter не подделывает production `initData`; он предоставляет только UI/platform defaults.
- Реальные auth requests не включать до готовности backend validation.

### 6. Axios boundary

- Создать один Axios instance/factory в `shared/api/http`.
- Base URL брать из validated config, не читать `import.meta.env` по всему приложению.
- Auth payload добавлять через внедрённый callback/provider.
- Нормализовать transport errors в собственный минимальный `ApiError` contract.
- Не показывать toast/навигацию из interceptors; UI reaction остаётся в feature/page layer.
- Настроить AbortSignal/cancellation, если generated client это поддерживает.

### 7. react-query-swagger

- Получить актуальный OpenAPI из backend, не использовать старый bot `swagger.json`.
- Сначала сгенерировать во временную директорию и проверить compile/output.
- Использовать TanStack mode, Axios template и module/tree-shakable output.
- Проверить конкретно: nullable, decimal, DateTime, optional params, operation names, query keys, mutations и auth factory.
- При дефекте генерации не менять generator автоматически: зафиксировать blocker и обсудить.
- После проверки настроить deterministic `api:generate`, обновляющий `openapi/backend.json` и `src/shared/api/generated/` при локальной разработке.
- Добавить `api:check`, который повторяет generation и завершается ошибкой при незакоммиченном diff.

Текущий статус: generation script подготовлен, но выполнение ждёт доступный актуальный Swagger endpoint локального backend. Не использовать вместо него устаревший Swagger bot adapter.

### 8. Tests

- Smoke test app bootstrap в BrowserPlatform.
- Test выбора platform adapter.
- Test идемпотентной Telegram initialization через mock boundary, без реального SDK environment.
- Test config validation и Axios auth injection без настоящих секретов.
- Generated code unit-тестами не покрывать.

### 9. CI

GitHub Actions на push/PR:

1. Corepack + exact Yarn;
2. immutable install;
3. format check;
4. lint;
5. typecheck;
6. tests;
7. production build;
8. `api:check`, повторно генерирующий и проверяющий отсутствие drift.

Deploy, Docker publish и Telegram configuration в foundation CI не добавлять.

## Definition of Done

- `yarn dev` запускает browser shell;
- `yarn build`, `typecheck`, `lint`, `format:check`, `test` проходят;
- React 19 работает без peer dependency warnings от выбранных runtime packages;
- Telegram SDK изолирован одним adapter layer;
- Browser mode не содержит fake production auth;
- FSD import boundaries проверяются линтером;
- Axios создаётся централизованно;
- `react-query-swagger` генерирует компилируемый TanStack Query/Axios client из актуального backend OpenAPI;
- repository status не содержит build/cache/secret мусора;
- CI выполняет quality gates;
- продуктовые экраны и новая UI-библиотека не добавлены.

## Stop conditions для исполняющего агента

Остановиться и спросить пользователя, если требуется:

- сменить React, TypeScript, Yarn, router, code generator или styling approach;
- добавить global state manager, UI kit, Tailwind/CSS-in-JS;
- изменить backend API ради удобства frontend;
- перестать коммитить OpenAPI snapshot/generated client или изменить их канонические пути;
- добавить production auth/deploy/Docker orchestration;
- принять существенный workaround для Telegram SDK или React 19.

## Политика API artifacts

Решение утверждено:

- коммитить актуальный snapshot как `openapi/backend.json`;
- коммитить deterministic output в `src/shared/api/generated/`;
- перегенерировать оба артефакта локально при изменениях backend API;
- не требовать доступный backend для обычного frontend build;
- CI выполняет повторную генерацию и `git diff --exit-code`, чтобы обнаруживать drift;
- generated code вручную не редактируется.
