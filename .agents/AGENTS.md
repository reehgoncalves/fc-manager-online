# FC Manager Online — contrato do agente

Antes de alterar o projeto, leia integralmente todos os arquivos Markdown dentro de `.agents/`.

A documentação em `.agents/` é o contrato operacional do produto: as regras de negócio, a arquitetura-alvo, as skills de implementação e os workflows obrigatórios têm precedência sobre suposições do agente. Se uma solicitação contradizer uma regra, registre a decisão em `.agents/decisions/` antes de implementar.

Índice principal: [`.agents/README.md`](.agents/README.md)

## Regra de Sincronização Diária (Handoff)
- Ao final do dia de trabalho ou em tarefas prolongadas, é obrigatório registrar um resumo exato de "onde paramos" e "quais são os próximos passos". 
- Dado que existe um limite diário de requisições (~100/dia), o agente deve sempre, sem exceção, deixar um `daily-handoff.md` atualizado ou registrar no `.agents/decisions` qual foi a última alteração feita e o que falta para completar a próxima fase.
- Ao iniciar o dia de trabalho, o agente deve ler o handoff para continuar de onde a sessão anterior parou.
