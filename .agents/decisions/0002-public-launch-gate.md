# ADR 0002 — critérios para liberar usuários públicos

## Status

Proposto.

## Decisão

Não liberar cadastro público baseado apenas no estado local do browser. A liberação pública exige autenticação real, API em ambiente persistente, migrations executadas, seeds de catálogo validados, carteira transacional, pagamento com webhook, rate limiting, recuperação de senha, observabilidade, backup e smoke test do fluxo cliente/admin.

## Motivo

O protótipo visual pode demonstrar a jornada, mas localStorage não protege moedas, compras, elenco ou identidade. Misturar demo com produção criaria risco de fraude, perda de dados e contas inconsistentes.
