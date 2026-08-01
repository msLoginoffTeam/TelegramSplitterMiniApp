# Project guidance for Codex

This repository is the canonical frontend checkout for Telegram Splitter Mini App.

Before planning or changing code, read:

1. `docs/PROJECT_CONTEXT.md` — frontend scope, repository map, accepted decisions and next steps.
2. `docs/KNOWN_ISSUES.md` — frontend-specific risks and unresolved decisions.
3. `/Users/max/RiderProjects/BudgetSplitterWebApi/docs/PROJECT_CONTEXT.md` — canonical product/domain/backend context when available locally.
4. `/Users/max/RiderProjects/BudgetSplitterWebApi/docs/KNOWN_ISSUES.md` — confirmed backend and cross-repository issues when available locally.

Keep the frontend documents current after material discoveries or architectural decisions. Do not duplicate the full backend issue list here; link to its canonical record and track only frontend or integration consequences.

The frontend and backend intentionally live in separate repositories. Generate the TypeScript/TanStack Query API layer from OpenAPI rather than maintaining handwritten duplicate contracts.

Never commit Telegram bot tokens, backend secrets or real `.env` files.
