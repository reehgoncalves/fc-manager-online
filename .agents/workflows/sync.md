# Workflow: sincronização de futebol

1. Ler provider, endpoint, temporada, ligas habilitadas e quota.
2. Executar em modo dry-run quando o esquema ou o provider tiver mudado.
3. Buscar ligas, times, jogadores, logos/bandeiras e estatísticas em páginas.
4. Normalizar IDs e nomes sem destruir o valor original.
5. Fazer upsert idempotente e registrar o `sync_run`.
6. Atualizar caches e publicar um evento de catálogo somente após consistência.
7. Manter dados anteriores quando a resposta externa estiver vazia, limitada ou fora da quota.
8. Exibir ao admin a última sincronização, provider, temporada, contagem e erro.
