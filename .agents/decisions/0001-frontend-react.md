# ADR 0001 — manter React/Next/Vinext no frontend

## Status

Aceito para a fase atual.

## Contexto

O projeto já está estruturado com React, TypeScript, Next/Vinext e CSS próprio. A referência visual é um jogo de gestão; não há evidência pública confiável de que o site de referência use Vue, e a aparência não depende de trocar o framework.

## Decisão

Continuar em React/TypeScript nesta fase e investir em componentes, tokens visuais, acessibilidade, estado remoto e animações leves. Uma migração para Vue só será considerada se houver ganho técnico mensurável e um plano separado.

## Consequências

Evita reescrever rotas, autenticação, estilos e integrações enquanto o produto ainda está consolidando o domínio. O layout pode ser claro, animado e original dentro da stack atual.
