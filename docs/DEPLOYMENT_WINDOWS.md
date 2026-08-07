# Production deployment: Windows + Tailscale Funnel

Этот репозиторий деплоит frontend на self-hosted GitHub Actions runner с label `splitter-prod`.

## Схема

```text
Telegram -> https://splitter-prod.tailb5d15d.ts.net -> Tailscale Funnel
         -> 127.0.0.1:8080 (frontend Nginx) -> splitter-internal -> API
```

Frontend не публикует API или БД в интернет. `API_UPSTREAM` в production всегда равен `http://splitter-api:8080` и доступен только во внешней Docker-сети `splitter-internal`.

## Первичный запуск на Windows host

1. После запуска backend-стека выполнить:

   ```powershell
   ./scripts/deploy-production.ps1
   ```

2. Когда frontend слушает `127.0.0.1:8080`, включить постоянный публичный endpoint:

   ```powershell
   tailscale funnel --bg 8080
   ```

   CLI попросит одобрить Funnel, включит нужные HTTPS/MagicDNS настройки и выведет URL. Для этого host он должен быть `https://splitter-prod.tailb5d15d.ts.net`.

3. Проверить URL с телефона по мобильной сети, затем указать его один раз в BotFather.

`tailscale funnel status` показывает текущую конфигурацию. Не используйте Cloudflare Quick Tunnel для production: его hostname временный.

## GitHub Actions runner

Создать **organization-level** runner в `msLoginoffTeam`: GitHub organization settings -> Actions -> Runners -> New self-hosted runner -> Windows. Это позволит одному runner обслуживать оба репозитория. При конфигурации добавить custom label `splitter-prod` и установить runner как Windows service **под тем же Windows-пользователем, который запускает Docker Desktop**. Так runner получит доступ к Docker daemon. Для service-конфигурации требуется PowerShell от администратора.

Workflow запускается только после успешного `quality` job при push в `main`. Он checkout'ит exact commit и локально выполняет `docker compose up -d --build`; registry, Docker Hub и SSH не используются.

## Эксплуатация

- Docker Desktop должен стартовать вместе с Windows и использовать Linux containers.
- Tailscale должен работать с `tailscale up --unattended=true`.
- После первого запуска проверить `docker compose -f compose.production.yml ps`, `docker logs telegram-splitter-web-web-1` и `tailscale funnel status`.
- Порт frontend фиксирован как loopback `127.0.0.1:8080`; secrets для frontend не нужны.
- Бэкап PostgreSQL и политика обновлений описываются в backend deployment guide.
