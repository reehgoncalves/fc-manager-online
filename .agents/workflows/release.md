# Workflow: release e publicação

## Pré-release

- Confirmar branch/commit e arquivos gerados.
- Rodar migrations em ambiente de staging antes de produção.
- Rodar seeds apenas em ambiente explicitamente autorizado.
- Configurar segredos no provedor, nunca em arquivos versionados.
- Confirmar callback OAuth, domínio, CORS, WebSocket, cron e webhook PIX.
- Rodar smoke test: landing deslogada, cadastro, login, logout, escolha de clube, compra, mercado, escalação, partida, ranking e admin.

## Pós-release

- Verificar status do deployment, logs e healthcheck.
- Testar uma conta cliente e uma conta admin separadas.
- Conferir que nenhuma chave aparece no HTML, bundle, logs públicos ou resposta de erro.
- Monitorar erro de login, compra, sync e WebSocket antes de liberar tráfego amplo.
