# Matriz de testes E2E

## Cliente

- Landing pública abre sem sessão.
- Cadastro válido cria usuário e carteira inicial.
- Cadastro duplicado, senha fraca e e-mail inválido são rejeitados.
- Login válido cria sessão; senha inválida não revela se o e-mail existe.
- Logout revoga sessão e impede chamadas protegidas.
- Redefinição de senha exige token de uso único e expiração.
- Usuário escolhe clube inicial ou compra clube premium uma única vez.
- Compra de jogador/item debita uma vez e entrega uma vez mesmo com retry.
- Saldo insuficiente não altera carteira nem inventário.
- Pedido PIX pendente não credita moedas.
- Webhook repetido é idempotente.
- Escalação só aceita jogadores do elenco e posições válidas.
- Ação de partida sem permissão, cooldown ou item é rejeitada.
- Realtime fora de ordem não retrocede o placar.

## Admin

- Manager não acessa rotas admin.
- Admin vê pedidos paginados e pode marcar pago/recusado com motivo.
- Crédito manual exige idempotência e auditoria.
- Admin pode consultar saúde/sync sem expor segredos.
- Valores, payloads sensíveis e tokens não aparecem em respostas públicas.

## Segurança e operação

- CORS limitado ao frontend configurado.
- Rate limit em auth, compra, webhook e ações de partida.
- Mass assignment coberto por `fillable`/DTOs.
- SQL parametrizado e validação de request.
- Logs sem senha, token, PIX key ou cartão.
- Migrations reproduzem em PostgreSQL; testes isolados usam driver compatível ou schema de teste dedicado.
- Build, lint, testes PHP e smoke test da publicação passam antes do release.
