# Operação do FC Manager Online

## Regra de leitura obrigatória

Antes de executar qualquer solicitação no projeto, leia todos os arquivos `*.md` desta pasta e suas subpastas. A leitura deve acontecer no início de cada tarefa, inclusive quando o pedido parecer apenas visual. O agente deve conferir as regras, a arquitetura vigente, a skill relacionada e o workflow aplicável.

Ordem recomendada:

1. `rules/` — limites de produto, segurança, dados e UX.
2. `architecture/` — fronteiras entre frontend, API, banco e realtime.
3. `skills/` — padrões técnicos de implementação.
4. `workflows/` — passos de execução, validação, publicação e sincronização.
5. `decisions/` — decisões registradas e seus motivos.

## Objetivo do produto

Construir um manager de futebol online responsivo, original e inspirado nos fluxos de jogos de gestão esportiva: carreira, escolha de liga e clube, mercado, elenco, escalação arrastável, estádio, ranking global, conquistas, itens elementais e partidas em tempo real.

O produto pode ter uma usabilidade familiar ao gênero, mas não deve copiar marca, textos, assets, código, layout pixel a pixel ou personagens de terceiros. Referências externas servem apenas para estudar padrões de navegação e clareza.

## Estado atual conhecido

- Frontend: Next/Vinext com React e TypeScript, usando CSS próprio.
- API planejada/existente: Laravel em `api/`.
- Persistência planejada: Supabase/Postgres e migrations em `supabase/migrations/`.
- Catálogo: `app/api/catalog/route.ts`, com fallback local e integração configurável.
- O fluxo visual atual possui uma sessão local de demonstração; compras e escalação devem ser tratadas como demo até a API autenticada estar conectada.
- Não declarar que migrations, PIX, OAuth, WebSocket, seeds ou sincronização externa estão em produção sem evidência verificável.

## Critério de pronto

Uma funcionalidade só é considerada pronta quando possui fluxo de sucesso, estado vazio, erro amigável, loading, responsividade, persistência correta, teste proporcional ao risco e documentação atualizada.
