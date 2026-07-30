# Workflow: implementar uma mudança

1. Ler `AGENTS.md` e todos os documentos de `.agents/`.
2. Inspecionar a rota, modelos, migrations e testes que já cobrem o comportamento.
3. Registrar uma decisão em `decisions/` se houver escolha de stack, contrato ou comportamento novo.
4. Implementar o menor recorte vertical: UI + estado + API/contrato + persistência quando aplicável.
5. Adicionar estados de loading, erro, vazio e sucesso.
6. Rodar `git diff --check`, lint, TypeScript e testes relevantes.
7. Fazer teste manual da rota e dos breakpoints quando a mudança for visual.
8. Atualizar docs, changelog técnico ou contrato da API.
9. Só publicar após build reproduzível e smoke test da URL publicada.

## Proibição de atalho

Não declarar “100% funcionando” quando o build, a autenticação, o backend, o pagamento ou a sincronização não foram efetivamente verificados no ambiente correspondente.
