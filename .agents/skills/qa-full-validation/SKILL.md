---
name: qa-full-validation
description: >
  Protocolo completo de QA e validação ponta a ponta do FC Manager Online.
  Cobre todas as telas, lógicas de jogo, menus, admin, sincronizações e layout.
  Executa testes e emite laudo detalhado. Deve rodar antes de qualquer lançamento
  ou PR significativo.
---

# Skill: QA Full Validation — FC Manager Online

## Quando usar esta skill

Execute este protocolo quando:
- Antes de qualquer lançamento público (deploy para produção)
- Após qualquer PR que altere mais de 2 arquivos
- Semanalmente para validar sincronizações e estado do jogo
- Quando um bug for reportado — para validar o impacto completo

## Saída esperada

Ao final da execução, gerar o laudo em:
`.agents/qa/laudo-YYYY-MM-DD.md`

---

## FASE 1 — Build & TypeScript

```bash
npm run build 2>&1 | tail -50
```

Critério: zero erros TypeScript, zero warnings de build críticos.

## FASE 2 — Validação Visual das Telas

Para cada rota abaixo, verificar:
- [ ] Rota carrega sem erro 500/404
- [ ] Layout correto (sidebar, topbar, conteúdo)
- [ ] Fontes Saira Condensed aplicadas em headings
- [ ] Cores do design system (verde #3fc974, fundo escuro)
- [ ] Responsivo em 1440px, 768px, 375px

### Rotas obrigatórias

| Rota | Tela | Status |
|------|------|--------|
| `/` | Landing Page | — |
| `/login` | Login | — |
| `/career` | Dashboard do Clube | — |
| `/lineup` | Escalação | — |
| `/live-match` | Partida ao Vivo | — |
| `/transfer-list` | Mercado | — |
| `/store` | Loja | — |
| `/stadium` | Estádio | — |
| `/standings` | Ranking | — |
| `/admin` | Admin | — |
| `/choose-league` | Escolher Liga | — |

## FASE 3 — Lógicas de Jogo

### 3.1 Motor de Partida (SSE)
- [ ] `/api/match/stream` responde 200 com Content-Type `text/event-stream`
- [ ] Eventos chegam a cada ~2 segundos
- [ ] `minute` incrementa de 1 a 90
- [ ] `ballX` e `ballY` estão entre 0 e 100
- [ ] `players` tem 22 tokens (11 home + 11 away)
- [ ] `homePower` + `awayPower` ≈ 100
- [ ] Tática `atk` → `homePower` > 60 na média
- [ ] Tática `def` → `homePower` < 45 na média
- [ ] Gol registrado: `homeScore` ou `awayScore` incrementa
- [ ] Evento de gol: `type === "goal"` presente no payload
- [ ] Aos 90 min: `status === "finished"` e stream fecha
- [ ] Reconexão: ao fechar e reabrir, novo match começa do minuto 1

### 3.2 Campo 3D ao Vivo
- [ ] 22 tokens de jogadores renderizados no campo
- [ ] Tokens home: cor verde (`#0fa050`)
- [ ] Tokens away: cor vermelha (`#c03020`)
- [ ] Bola branca visível se movendo
- [ ] Bola transiciona suavemente (CSS transition .6s)
- [ ] Jogadores transitam suavemente (CSS transition .8s)
- [ ] Com tática `atk`: bola permanece mais tempo em `ballY < 40`
- [ ] Overlay "GOOOOL!" aparece por ~2.5s quando gol

### 3.3 Escalação
- [ ] 4 formações funcionam: 4-4-2, 4-3-3, 3-5-2, 5-3-2
- [ ] Troca de formação reposiciona tokens no campo
- [ ] Drag & drop funciona entre posições
- [ ] Rating médio calculado e exibido corretamente
- [ ] Botão "Salvar" exibe toast de sucesso
- [ ] Link "Jogar Agora" navega para /live-match

### 3.4 Mercado de Transferências
- [ ] Filtros de posição funcionam (GOL, ZAG, ATA, etc.)
- [ ] Campo de busca filtra por nome e clube
- [ ] Botão "Contratar" exibe toast de confirmação
- [ ] Lista atualiza ao mudar filtro
- [ ] Cards exibem rating, posição, clube e preço

### 3.5 Loja
- [ ] 3 tabs funcionam: FC Coins, Jogadores Especiais, Arsenal Elemental
- [ ] Pacotes de coins renderizam com preço
- [ ] Botão "Comprar" exibe mensagem de PIX pendente
- [ ] Cards de jogadores têm efeito holográfico (hover)
- [ ] Itens elementais exibem bônus, elemento e raridade

### 3.6 Estádio
- [ ] Stats do estádio renderizados (capacidade, nível, receita)
- [ ] Lista de upgrades com barra de progresso
- [ ] Botão "Melhorar" exibe toast
- [ ] Botão "Expandir" exibe toast

## FASE 4 — Navegação e Menus

- [ ] Sidebar expande ao hover (desktop)
- [ ] Link ativo tem highlight verde
- [ ] Todos os 8 links navegam para a rota correta sem erro
- [ ] Mobile (375px): sidebar vira bottom nav com 8 ícones
- [ ] Topbar mostra saldo de coins
- [ ] Botão "+ Comprar" navega para /store
- [ ] Indicador de API (badge) mostra estado correto
- [ ] Sair (quando implementado) limpa sessão

## FASE 5 — Painel Admin

- [ ] Tab "Overview" mostra métricas (users, active, orders, players)
- [ ] Tab "Saúde" mostra status dos serviços (verde/laranja/vermelho)
- [ ] Tab "Pedidos" mostra estado correto (vazio ou lista)
- [ ] Log de sistema exibe status real dos componentes

## FASE 6 — Sincronizações

### 6.1 API de Catálogo
- [ ] `GET /api/catalog` retorna 200
- [ ] Resposta contém `players`, `leagues`, `items`, `stadiums`
- [ ] Fallback local funciona quando API retorna erro
- [ ] Badge de status muda para "Demo" em fallback

### 6.2 Autenticação
- [ ] `GET /api/auth/me` retorna 200 se logado
- [ ] Redireciona para /login em 401/403 (quando implementado)
- [ ] `POST /api/auth/logout` limpa cookie e redireciona

## FASE 7 — Performance & Acessibilidade

- [ ] First Contentful Paint < 2s (desktop)
- [ ] Sem console errors no carregamento inicial
- [ ] Imagens sem src quebrado (sem 404 de assets)
- [ ] Todos botões interativos têm `aria-label` ou texto visível
- [ ] Focus visible funciona em todos elementos interativos
- [ ] `prefers-reduced-motion`: animações desativadas
- [ ] Contraste mínimo WCAG AA em textos principais

## FASE 8 — Mobile Ponta a Ponta

Em viewport 375×812 (iPhone SE):
- [ ] Bottom nav visível e funcional
- [ ] HUD de partida legível
- [ ] Campo de jogo visível e com jogadores
- [ ] Cards de jogador não extravasam
- [ ] Formulários de busca usáveis
- [ ] Toast posicionado corretamente

---

## Template do Laudo

O agente deve preencher e salvar em `.agents/qa/laudo-{DATA}.md`:

```markdown
# Laudo QA — FC Manager Online
**Data:** YYYY-MM-DD
**Versão:** (último commit hash)
**Executado por:** (Agente/Manual)

## Resultado Geral
- ✅ APROVADO / ❌ REPROVADO / ⚠️ APROVADO COM RESSALVAS

## Sumário Executivo
(3–5 linhas descrevendo o estado geral)

## Resultados por Fase

| Fase | Critérios | Passou | Falhou | % |
|------|-----------|--------|--------|---|
| 1 Build | X | X | X | X% |
| 2 Visual | X | X | X | X% |
| 3 Lógicas | X | X | X | X% |
| 4 Navegação | X | X | X | X% |
| 5 Admin | X | X | X | X% |
| 6 Sync | X | X | X | X% |
| 7 Performance | X | X | X | X% |
| 8 Mobile | X | X | X | X% |

## Falhas Detectadas

### BLOQUEADORES (impedem lançamento)
- [ ] Nenhum / listar

### CRÍTICOS (corrigir em 24h)
- [ ] Nenhum / listar

### MELHORIAS (não bloqueiam)
- [ ] Nenhum / listar

## Evidências
(screenshots, logs, outputs de build)

## Próximos Passos
(ações a tomar antes do próximo teste)
```
