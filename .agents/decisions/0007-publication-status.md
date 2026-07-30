# ADR 0007 — Estado verificado da publicação em 30/07/2026

## Decisão

O frontend Next.js está publicado na Vercel e foi validado no domínio principal. O
backend Laravel, migrations/seeds do banco e contas de teste continuam bloqueados
até existir um runtime PHP configurado e uma conexão de banco compatível.

## Evidências

- Commit publicado no GitHub: `7215fc0`.
- Deployment Vercel correspondente ficou `Ready`.
- `https://fc-manager-online.vercel.app/` respondeu `200` e renderizou a landing page.
- `GET /api/catalog` respondeu `200`, mas ainda é o catálogo local da camada web.
- `POST /api/auth/login` respondeu `503` com `API do jogo ainda não está configurada.`.
- O projeto Supabase está saudável, porém a consulta de `information_schema.tables`
  em `public` retornou nenhuma linha.

## Consequência

Não criar nem divulgar credenciais de admin/gamer ainda. Migrations nativas do
Supabase não devem ser executadas junto das migrations Laravel enquanto o ADR 0005
não for reconciliado; fazer isso criaria dois schemas incompatíveis.
