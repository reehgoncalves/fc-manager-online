alter table if exists public.players add column if not exists avatar_url text;
create index if not exists players_avatar_idx on public.players (avatar_url) where avatar_url is not null;
