-- Migration: 20250730000000_player_stats_columns.sql
-- Adds detailed performance stat fields and nationality for star player cards.

alter table public.players
  add column if not exists nationality text,
  add column if not exists age smallint,
  add column if not exists goals integer default 0,
  add column if not exists assists integer default 0,
  add column if not exists appearances integer default 0,
  add column if not exists match_rating numeric(3,1) default 6.0;

create index if not exists players_star_rating_idx on public.players (rating desc, is_extreme desc) where is_listed = true;
