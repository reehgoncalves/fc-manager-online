# ADR 0005 — fonte de execução do schema

## Status

Aceito para esta etapa, com reconciliação pendente antes de produção.

## Decisão

O schema executado pela API é o conjunto de migrations do Laravel em api/database/migrations. Ele foi escrito para PostgreSQL/Supabase e usa IDs inteiros, Sanctum e a tabela users da própria aplicação. A pasta supabase/migrations mantém um schema RLS nativo baseado em auth.users e UUIDs para uso futuro com Supabase Auth.

Esses dois conjuntos não devem ser aplicados simultaneamente no mesmo banco. Antes de produção, escolher uma única linha de identidade e gerar uma migration de reconciliação; a implementação atual usa Laravel/Sanctum como autoridade conforme ADR 0003.

## Motivo

Misturar IDs inteiros do Laravel com UUIDs de auth.users causaria chaves estrangeiras incompatíveis, falhas no seed e autorização inconsistente. Registrar a divergência evita uma falsa garantia de que qualquer sequência de migrations é segura.
