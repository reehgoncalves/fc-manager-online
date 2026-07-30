# ADR 0006 — runtime de produção da API

## Status

Aceito como gate de publicação.

## Decisão

O Vercel hospeda o frontend, mas não substitui um runtime PHP persistente para o Laravel com worker de fila, scheduler e Reverb/WebSocket. O Supabase fornece Postgres, mas não executa a API Laravel.

Antes de abrir o cadastro público, a API deve estar em uma hospedagem PHP/contêiner com HTTPS, `queue:work`, scheduler, endpoint de health e processo realtime supervisionado. O frontend só receberá `API_URL` depois que essa API estiver acessível e validada.

## Motivo

Apontar `API_URL` para o próprio Vercel sem uma API Laravel funcional faria login, carteira, compras, sincronização e partidas retornarem erro ou dependerem de fallback local. Isso violaria a autoridade do servidor e o gate de lançamento público.
