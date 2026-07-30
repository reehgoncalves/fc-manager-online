-- Operational hardening for wallet, PIX settlement, idempotency and audit.
-- The Laravel API remains the authority for writes; clients must not write these tables directly.
alter table if exists public.teams add column if not exists price_fc bigint not null default 0 check (price_fc >= 0);
alter table if exists public.players add column if not exists price_fc bigint not null default 0 check (price_fc >= 0);
alter table if exists public.players add column if not exists version bigint not null default 1;
alter table if exists public.items add column if not exists price_fc bigint not null default 0 check (price_fc >= 0);
alter table if exists public.items add column if not exists version bigint not null default 1;
alter table if exists public.orders add column if not exists payment_method text not null default 'pix';
alter table if exists public.orders add column if not exists idempotency_key text;
alter table if exists public.orders add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table if exists public.orders add column if not exists settled_by uuid references auth.users(id) on delete set null;
create unique index if not exists orders_user_id_idempotency_idx on public.orders(user_id, idempotency_key) where idempotency_key is not null;
alter table if exists public.wallet_transactions add column if not exists idempotency_key text;
alter table if exists public.wallet_transactions add column if not exists balance_after bigint;
create unique index if not exists wallet_transactions_idempotency_idx on public.wallet_transactions(wallet_id, idempotency_key) where idempotency_key is not null;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users(id) on delete set null,
  action text not null, auditable_type text, auditable_id uuid, ip_address inet, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(), provider text not null, external_id text not null, event_type text,
  payload jsonb not null, processed_at timestamptz, error_message text, created_at timestamptz not null default now(),
  unique(provider, external_id)
);
create table if not exists public.match_actions (
  id uuid primary key default gen_random_uuid(), match_id uuid references public.matches(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null, action text not null, player_name text,
  sequence bigint not null default 0, idempotency_key text, payload jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
  unique(match_id, sequence), unique(match_id, user_id, idempotency_key)
);

alter table public.audit_logs enable row level security;
alter table public.webhook_events enable row level security;
alter table public.match_actions enable row level security;
create policy "owners read own match actions" on public.match_actions for select using (auth.uid() = user_id);
create policy "audit logs are server only" on public.audit_logs for select using (false);
create policy "webhook events are server only" on public.webhook_events for select using (false);
