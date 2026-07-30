# Arquitetura-alvo

## Camadas

```text
Browser (React/TypeScript)
        │ HTTPS / WebSocket
        ▼
Laravel API ─── fila/cron ─── Football data provider
        │
        ▼
Supabase Postgres + Auth + Storage + Realtime
        │
        └── Admin API / painel administrativo
```

## Frontend

- Organizar telas por domínio: auth, career, club, squad, market, stadium, ranking, match e admin.
- Preferir componentes reutilizáveis para cards de jogador, item, saldo, clube, ranking, tabela e estado de conexão.
- Estado remoto deve ter cache, invalidação e tratamento de loading/erro; estado local serve para interação transitória.
- O frontend atual usa React/Next/Vinext. Não migrar para Vue apenas por aparência: a linguagem não determina o visual e a migração só deve ocorrer com ADR, plano de compatibilidade e benefício comprovado.

## Laravel API

- Authenticated routes devem usar autorização por recurso e políticas.
- Controllers finos; regras de compra, saldo, mercado e partidas ficam em Services/Actions.
- Jobs de sincronização devem ser idempotentes, paginados, limitados por quota e registrados em `sync_runs`.
- Webhooks devem validar assinatura, armazenar evento recebido e ser processados de forma idempotente.

## Banco

- Toda tabela de negócio precisa de chave, timestamps, índices de busca e restrições coerentes.
- Preços e valores financeiros devem ser inteiros em centavos; FC interno deve ter precisão definida e ledger auditável.
- Não apagar dados de produção em migrations. Mudanças destrutivas precisam de plano de migração e backup.
- Seeds de demonstração devem ser separados de dados reais e nunca inserir credenciais administrativas padrão em ambiente público.

## Integrações

- A API de futebol é fonte para jogadores, times, ligas, logos/bandeiras e estatísticas permitidas pelo contrato.
- Nenhuma API garante “100% sempre atualizado”: usar TTL, fallback, retry com backoff, quota, auditoria e tela de status.
- URLs de imagens externas devem ter fallback e política de cache; não depender de uma imagem externa para o layout funcionar.
- A publicação permanece bloqueada enquanto o schema Laravel/Supabase não for escolhido e validado em staging; veja ADR 0005.
