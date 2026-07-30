# ADR 0004 — PIX e recebedor

## Status

Aceito com configuração pendente.

## Decisão

O CNPJ `40.083.961/0002-02` será configurado no provedor PIX escolhido pelo responsável financeiro. O código não presume banco, chave ou credencial. O admin pode realizar conferência manual controlada, mas todo crédito precisa de auditoria e não substitui webhook em produção.

## Motivo

Sem PSP, credencial e webhook não existe como o sistema confirmar que um pagamento caiu. Exibir “pago” apenas por retorno do navegador seria inseguro.
