# ADR 0003 — API como autoridade de dados

## Status

Aceito para a implementação E2E.

## Decisão

Saldo, sessão, compras, inventário, elenco, escalação, partida e permissões serão resolvidos no Laravel. Supabase/Postgres será o armazenamento. O frontend não poderá concluir uma compra, creditar moedas ou autorizar admin somente com JavaScript/localStorage.

## Motivo

Dados no browser podem ser modificados pelo próprio usuário e não protegem contra replay, concorrência ou fraude.
