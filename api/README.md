# FC Manager Online API

API Laravel para autenticação, elenco, mercado, itens com poderes elementais, carteira de FC coins, pedidos de PIX, ranking global e administração.

## Contrato de autoridade

O navegador nunca é a fonte de verdade de sessão, moedas, compras, inventário ou escalação. O Laravel valida o token Sanctum e executa as operações em transações de banco; o Supabase/Postgres hospeda os dados persistentes. `localStorage` é reservado para preferências visuais e drafts não autoritativos.

## Fluxo local

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
php artisan schedule:work
```

## Publicar a API no Vercel

O diretório `api/` pode ser criado como um projeto Vercel separado, com a raiz
do projeto apontando para `api/`. O arquivo `vercel.json` usa o runtime
`vercel-php` e encaminha as requisições para `api/index.php`.

Configure as variáveis do `.env.example` no projeto Vercel. No mínimo:

- `APP_KEY`, `APP_URL` e `FRONTEND_URL`;
- `DB_CONNECTION=pgsql`, host/porta/banco/usuário/senha do Postgres Supabase e
  `DB_SSLMODE=require`;
- `SANCTUM_STATEFUL_DOMAINS` com o domínio do frontend;
- `FOOTBALL_DATA_PROVIDER_URL` e `FOOTBALL_DATA_PROVIDER_KEY`.

O runtime serverless atende HTTP, mas não mantém worker de fila ou processo
WebSocket contínuo. Para o lançamento com sincronização agendada e realtime,
use um worker/scheduler e um broadcaster persistentes fora do Vercel, ou deixe
esses recursos explicitamente degradados até essa infraestrutura existir.

O comando `game:sync-data` e o job `SyncFootballDataJob` são executados a cada 15 minutos quando `FOOTBALL_DATA_PROVIDER_URL` e `FOOTBALL_DATA_PROVIDER_KEY` estiverem configurados. O webhook do provedor PIX deve validar `X-Pix-Signature`, armazenar o evento em `webhook_events` e liquidar `orders` de forma idempotente usando `provider_reference` e `idempotency_key`.

## Segurança de pagamentos

`PIX_RECEIVER_TAX_ID=40083961000202` identifica o recebedor configurado no PSP. O CNPJ sozinho não confirma recebimento: configure `PIX_PROVIDER_URL`, `PIX_PROVIDER_KEY` e `PIX_WEBHOOK_SECRET` no ambiente do servidor. O painel administrativo permite conferência manual auditada para operação controlada; em produção, a confirmação deve vir do webhook assinado.

O seed não aceita senha administrativa padrão. Defina `SEED_ADMIN_PASSWORD` e `SEED_DEMO_PASSWORD` apenas no ambiente em que o seed será executado e nunca comite esses valores.

## Endpoints principais

- `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `DELETE /api/v1/auth/logout`.
- `POST /api/v1/wallet/orders` para criar cobrança PIX de FC; exige `Idempotency-Key`.
- `POST /api/v1/transfers/{player}/buy` para compra com FC ou criação de pedido PIX; exige `Idempotency-Key`.
- `POST /api/v1/items/{item}/buy` e `PUT /api/v1/teams/{team}/choose` para operações autenticadas.
- `POST /api/v1/webhooks/pix` para o PSP; assinatura obrigatória.
- `GET/PATCH /api/v1/admin/orders`, `GET /api/v1/admin/metrics`, `POST /api/v1/admin/sync` apenas para `role=admin`.

## Partidas em tempo real
O caminho Laravel e o schema SQL nativo em supabase/migrations não devem ser executados juntos no mesmo banco nesta versão: o primeiro usa public.users inteiro + Sanctum, e o segundo usa auth.users UUID. A reconciliação é um gate de produção documentado em .agents/decisions/0005-schema-execution.md.
Para processamento assíncrono em staging/produção, use QUEUE_CONNECTION=database, execute php artisan queue:work --tries=3 e mantenha o scheduler/worker sob supervisão. O valor sync no exemplo mantém o ambiente local funcional sem um worker separado.

As ações usam `POST /api/v1/matches/{matchId}/actions` e o evento `MatchStateUpdated` em `PrivateChannel(matches.{matchId})`. Configure Laravel Reverb (ou outro broadcaster compatível) nas variáveis `REALTIME_*`; o frontend usa `NEXT_PUBLIC_WS_URL` e mantém um modo local seguro enquanto o WebSocket estiver indisponível.
### Avatares dos jogadores

O catálogo persiste `players.avatar_url` e o frontend usa esse campo em todos os cards, escalação, transferências e partida ao vivo. O job aceita `avatar_url`, `photo` ou `image_url` no snapshot do provedor; como fallback, `PLAYER_AVATAR_URL_TEMPLATE` pode apontar para um CDN compatível, por exemplo a URL de fotos do API-Football/API-Sports:

`PLAYER_AVATAR_URL_TEMPLATE=https://media.api-sports.io/football/players/{id}.png`

Essas URLs devem ser usadas conforme o plano e os termos do provedor. A animação de flutuação/brilho é feita no CSS do FC Manager; a API entrega o headshot, não um sprite animado.
