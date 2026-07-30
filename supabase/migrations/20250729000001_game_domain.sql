create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(), external_id text unique not null, name text not null,
  country text not null, tier text not null default 'standard', club_count smallint not null default 20,
  is_premium boolean not null default false, logo_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(), league_id uuid references public.leagues(id) on delete cascade not null,
  external_id text unique not null, name text not null, starts_at date not null, ends_at date not null,
  status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.league_teams (
  league_id uuid references public.leagues(id) on delete cascade not null, team_id uuid references public.teams(id) on delete cascade not null,
  season_id uuid references public.seasons(id) on delete cascade not null, position smallint, points integer not null default 0, primary key (league_id, team_id, season_id)
);
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(), season_id uuid references public.seasons(id) on delete cascade not null,
  external_id text unique not null, home_team_id uuid references public.teams(id) on delete cascade not null, away_team_id uuid references public.teams(id) on delete cascade not null,
  kickoff_at timestamptz, status text not null default 'scheduled', home_score smallint, away_score smallint, events jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.lineups (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null,
  match_id uuid references public.matches(id) on delete cascade not null, team_id uuid references public.teams(id) on delete cascade not null,
  formation text not null, tactic text not null default 'balanced', settings jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id, match_id)
);
create table if not exists public.lineup_players (
  lineup_id uuid references public.lineups(id) on delete cascade not null, player_id uuid references public.players(id) on delete cascade not null,
  position text not null, role text, primary key (lineup_id, player_id)
);
create table if not exists public.stadiums (
  id uuid primary key default gen_random_uuid(), external_id text unique, name text not null, capacity integer not null,
  level smallint not null default 1, revenue_multiplier numeric(6,3) not null default 1, visual jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.team_stadiums (
  team_id uuid references public.teams(id) on delete cascade not null, stadium_id uuid references public.stadiums(id) on delete cascade not null,
  is_primary boolean not null default true, created_at timestamptz not null default now(), primary key(team_id, stadium_id)
);
create table if not exists public.stadium_upgrades (
  id uuid primary key default gen_random_uuid(), stadium_id uuid references public.stadiums(id) on delete cascade not null,
  name text not null, category text not null, level smallint not null default 1, max_level smallint not null default 10,
  price_cents bigint not null, effects jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.power_types (
  id uuid primary key default gen_random_uuid(), key text unique not null, name text not null, element text not null,
  description text not null, default_bonus smallint not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.player_inventory (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null,
  item_id uuid references public.items(id) on delete cascade not null, equipped_player_id uuid references public.players(id) on delete set null,
  quantity smallint not null default 1, durability smallint not null default 100, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.sync_runs (
  id uuid primary key default gen_random_uuid(), resource text not null, status text not null, records_processed integer not null default 0,
  started_at timestamptz not null, finished_at timestamptz, error_message text, provider_cursor text, created_at timestamptz not null default now()
);
create index if not exists matches_kickoff_idx on public.matches(kickoff_at, status);
create index if not exists seasons_status_idx on public.seasons(status, starts_at);
create index if not exists sync_runs_status_idx on public.sync_runs(resource, started_at desc);
alter table public.leagues enable row level security;
alter table public.seasons enable row level security;
alter table public.league_teams enable row level security;
alter table public.matches enable row level security;
alter table public.stadiums enable row level security;
alter table public.stadium_upgrades enable row level security;
alter table public.power_types enable row level security;
alter table public.sync_runs enable row level security;
alter table public.lineups enable row level security;
alter table public.lineup_players enable row level security;
alter table public.player_inventory enable row level security;
create policy "leagues are readable" on public.leagues for select using (true);
create policy "seasons are readable" on public.seasons for select using (true);
create policy "league standings are readable" on public.league_teams for select using (true);
create policy "matches are readable" on public.matches for select using (true);
create policy "stadiums are readable" on public.stadiums for select using (true);
create policy "stadium upgrades are readable" on public.stadium_upgrades for select using (true);
create policy "powers are readable" on public.power_types for select using (true);
create policy "owners read lineups" on public.lineups for select using (auth.uid() = user_id);
create policy "owners write lineups" on public.lineups for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owners read lineup players" on public.lineup_players for select using (exists(select 1 from public.lineups l where l.id = lineup_id and l.user_id = auth.uid()));
create policy "owners read inventory" on public.player_inventory for select using (auth.uid() = user_id);
create policy "sync runs are private" on public.sync_runs for select using (false);
