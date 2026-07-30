# Arquitetura E2E escolhida

## Identidade

Na primeira versão pública, o Laravel será a autoridade de autenticação e usará Sanctum para tokens revogáveis. O Supabase será o Postgres persistente e não será tratado como uma segunda fonte de verdade de usuários. O frontend fala com a API por HTTPS; tokens não entram em bundles, logs ou URLs.

Google e Facebook ficam atrás de configuração explícita de OAuth e só serão habilitados quando callback, secrets, domínio e testes do provedor estiverem configurados. Até lá, a UI deve mostrar indisponibilidade honesta em vez de fingir login social.

## Dados e economia

- O servidor calcula preço, saldo, entrega e poderes.
- `orders` representa checkout/PIX; `wallet_transactions` representa cada crédito ou débito.
- Uma operação de compra usa transação de banco e chave de idempotência.
- Crédito ocorre apenas após webhook validado ou ação administrativa auditada.
- O frontend recebe um snapshot atualizado; browser storage pode guardar somente preferências/drafts.

## PIX

O CNPJ `40.083.961/0002-02` será tratado como dado de configuração/recebedor do provedor, não como prova de pagamento. A confirmação real depende do PSP bancário, credenciais, QR/dados de cobrança e webhook assinado. O painel admin terá uma ação manual de conferência para ambientes controlados, exigindo motivo e deixando auditoria.

## Partida

O Laravel grava o snapshot da partida e valida ações. Broadcast/WebSocket entrega eventos com `version`; o cliente ignora evento antigo e recupera REST ao reconectar. A simulação local só aparece quando a API realtime não está configurada e deve ser identificada na interface.

## Sincronização

O job de futebol trabalha por recurso e temporada, respeita quota, faz upsert por `external_id`, não apaga catálogo quando recebe resposta parcial e grava `sync_runs`. O painel mostra última execução, quantidade e erro.
