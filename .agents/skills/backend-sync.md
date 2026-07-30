# Skill: API, sincronização e economia

## Sincronização externa

- Confirmar provider, temporada, ligas e quota antes de executar carga.
- Buscar em páginas pequenas, usar `upsert` por identificador externo e preservar a origem.
- Registrar início, fim, duração, contagens, erros e cursor em `sync_runs`.
- Não substituir um catálogo saudável por resposta vazia ou parcial sem marcar a sincronização como degradada.
- Imagens podem falhar independentemente dos dados; tratar avatar/flag como campos opcionais com fallback.

## Compras

- Calcular preço no servidor.
- Abrir transação de banco, bloquear/verificar carteira e gravar débito e entrega na mesma operação.
- Aceitar `Idempotency-Key` para retries do cliente.
- Retornar saldo, recibo e entidade entregue em uma resposta consistente.

## Admin

- Admin é uma role autorizada no servidor, nunca apenas uma rota escondida no frontend.
- Ações de catalogação, crédito manual, preço e banimento exigem auditoria com ator, motivo e payload resumido.
