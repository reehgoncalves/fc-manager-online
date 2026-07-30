create extension if not exists "pgcrypto";

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(), external_id text unique not null, name text not null,
  short_name text, country text, flag_url text, logo_url text, rating smallint not null default 0 check (rating between 0 and 100),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(), team_id uuid references public.teams(id) on delete set null,
  external_id text unique not null, name text not null, role text not null, club_name text not null,
  rating smallint not null check (rating between 0 and 100), price_cents bigint not null default 0, avatar_url text,
  tier text not null check (tier in ('silver','gold','diamond','extreme')), is_extreme boolean not null default false,
  is_listed boolean not null default true, stats jsonb not null default '{}'::jsonb, tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(), name text not null, category text not null,
  element text not null check (element in ('fogo','agua','raio','vento','gelo')), power smallint not null check (power between 1 and 30),
  effect text not null, price_cents bigint not null, icon text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.manager_players (
  user_id uuid references auth.users(id) on delete cascade not null, player_id uuid references public.players(id) on delete cascade not null,
  created_at timestamptz not null default now(), primary key (user_id, player_id)
);
create table if not exists public.player_items (
  player_id uuid references public.players(id) on delete cascade not null, item_id uuid references public.items(id) on delete cascade not null,
  equipped_at timestamptz, created_at timestamptz not null default now(), primary key (player_id, item_id)
);
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade unique not null,
  balance bigint not null default 0 check (balance >= 0), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(), wallet_id uuid references public.wallets(id) on delete cascade not null,
  type text not null, amount bigint not null, reference text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null,
  kind text not null check (kind in ('coins','player')), status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  total_cents bigint not null, payload jsonb not null default '{}'::jsonb, provider_reference text unique,
  paid_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.manager_rankings (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null,
  season text not null, scope text not null default 'global', rank integer not null, points integer not null,
  wins integer not null default 0, matches integer not null default 0, division text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(user_id, season, scope)
);
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(), inviter_id uuid references auth.users(id) on delete cascade not null,
  invitee_id uuid references auth.users(id) on delete set null, code text unique not null, status text not null default 'sent',
  inviter_reward bigint not null default 3000, invitee_reward bigint not null default 2000, completed_at timestamptz, created_at timestamptz not null default now()
);

create index if not exists players_listing_idx on public.players (is_listed, tier, rating desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);
create index if not exists rankings_idx on public.manager_rankings (season, scope, rank);

alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.items enable row level security;
alter table public.manager_players enable row level security;
alter table public.player_items enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.orders enable row level security;
alter table public.manager_rankings enable row level security;
alter table public.referrals enable row level security;
create policy "teams are readable" on public.teams for select using (true);
create policy "players are readable" on public.players for select using (is_listed = true);
create policy "items are readable" on public.items for select using (true);
create policy "managers read own players" on public.manager_players for select using (auth.uid() = user_id);
create policy "managers add own players" on public.manager_players for insert with check (auth.uid() = user_id);
create policy "managers read equipped items" on public.player_items for select using (exists (select 1 from public.manager_players mp where mp.player_id = player_id and mp.user_id = auth.uid()));
create policy "owners read wallets" on public.wallets for select using (auth.uid() = user_id);
create policy "owners read transactions" on public.wallet_transactions for select using (exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid()));
create policy "owners read orders" on public.orders for select using (auth.uid() = user_id);
create policy "rankings are readable" on public.manager_rankings for select using (true);
create policy "owners read referrals" on public.referrals for select using (auth.uid() = inviter_id or auth.uid() = invitee_id);
