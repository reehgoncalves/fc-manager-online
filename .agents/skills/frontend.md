# Skill: frontend de jogo de gestão

## Ao alterar uma tela

1. Identificar a rota e o domínio funcional.
2. Reutilizar tokens, componentes e classes existentes antes de criar variações.
3. Modelar explicitamente loading, vazio, erro, sucesso e reconexão.
4. Verificar desktop, tablet, mobile estreito e teclado.
5. Verificar que ações não autenticadas redirecionam para login sem loop.
6. Se a ação altera moeda, elenco ou escalação, persistir via API quando disponível e manter fallback visual claramente identificado.

## Cards de jogador

Mostrar raridade, rating, posição, clube, preço, avatar/fallback, item equipado e ação disponível. A imagem não deve ser necessária para entender o card. Não usar assets copiados de jogos de terceiros.

## Realtime

Representar conexão como `connecting`, `connected`, `degraded` ou `offline`. Ao receber estado fora de ordem, comparar versão/sequence antes de atualizar a UI. Após reconectar, buscar o snapshot REST mais recente.

## Qualidade

Preferir TypeScript estrito, funções pequenas, nomes de domínio explícitos e efeitos React com cleanup. Não esconder erros com `catch` vazio; registrar estado seguro e mensagem para o usuário.
