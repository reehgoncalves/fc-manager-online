# Regras de produto e negócio

## Conta e identidade

- Login, cadastro, redefinição de senha, Google e Facebook devem usar provedores reais somente quando o backend e as credenciais estiverem configurados.
- A sessão deve ser revogável e o botão Sair deve limpar o cliente e invalidar o token no servidor.
- Nunca colocar senha, token OAuth, chave de API, segredo do Supabase ou chave PIX no frontend, no Git ou em mensagens.
- O nome exibido, clube, saldo e elenco devem vir do perfil autenticado; valores locais são apenas fallback de demonstração.

## Economia, compras e moedas

- FC é a moeda interna. Todo débito deve ser transacional, idempotente e registrado em `wallet_transactions`.
- O saldo nunca deve ser alterado apenas pelo browser em uma versão pública.
- Compra de clube, jogador, item, plano ou moeda deve validar saldo, preço vigente, disponibilidade e concorrência no servidor.
- PIX deve confirmar por webhook do provedor antes de creditar moedas. A tela de sucesso do checkout não é prova de pagamento.
- Compras repetidas devem ter comportamento explícito: item consumível, item duplicável ou item já possuído.

## Jogadores, itens e poderes

- Raridades suportadas: Prata, Ouro, Diamante e Extremo.
- Itens devem declarar slot, elemento, bônus, regras de ativação, duração/cargas e compatibilidade.
- Slots iniciais: chuteira, luva, colar, touca e máscara; novos slots precisam de migração e documentação.
- Poderes elementais devem ser balanceados no servidor e registrados no evento da partida; o cliente apenas apresenta a decisão e o resultado autorizado.
- Avatares e escudos de terceiros só podem ser usados com licença ou fonte autorizada. Se a API não fornecer imagem válida, usar fallback próprio.

## Partida e realtime

- A simulação autoritativa roda no servidor. WebSocket transmite estado assinado/versionado; REST continua sendo o caminho de recuperação.
- Ações de ataque, defesa, substituição e poder de item precisam de validação de minuto, energia, cooldown e elenco.
- O cliente deve mostrar reconexão, estado offline, último evento e sincronização do placar.
- Narrador e barra de força são apresentação do estado, não a fonte de verdade do resultado.

## UX e visual

- O frontend deve ser claro, responsivo e animado com moderação: animação nunca pode impedir leitura, teclado ou acessibilidade.
- Usar o sistema visual próprio do FC Manager Online: cores claras, verde-água, azul suave e acentos coral/dourado.
- Manter padrões consistentes de menu, cards, botões, toasts, loading e mensagens de erro.
- Respeitar `prefers-reduced-motion`, foco visível, labels e contraste.
