-- Migration: 00_game_schema.sql
-- Description: Game-centric DB schema for FC Manager Online (OSM Style)

-- 1. Profiles (Managers)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE NOT NULL, -- references auth.users(id) in real Supabase setup
  name text NOT NULL,
  coins integer DEFAULT 3000,
  role text DEFAULT 'manager',
  created_at timestamptz DEFAULT now()
);

-- 2. Teams
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  stadium_level integer DEFAULT 1,
  formation text DEFAULT '4-3-3',
  tactic text DEFAULT 'bal', -- atk, def, bal
  budget integer DEFAULT 5000000,
  created_at timestamptz DEFAULT now()
);

-- 3. Players
CREATE TABLE IF NOT EXISTS public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  name text NOT NULL,
  position text NOT NULL,
  rating integer NOT NULL CHECK (rating > 0 AND rating <= 100),
  tier text DEFAULT 'bronze',
  price integer DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

-- 4. Matches (Real-time tracking)
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id uuid REFERENCES public.teams(id),
  away_team_id uuid REFERENCES public.teams(id),
  status text DEFAULT 'scheduled', -- scheduled, live, finished
  minute integer DEFAULT 0,
  home_score integer DEFAULT 0,
  away_score integer DEFAULT 0,
  live_events jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Items (Elemental Arsenal)
CREATE TABLE IF NOT EXISTS public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  element_type text NOT NULL, -- Fogo, Água, Raio, Vento, Gelo
  bonus integer DEFAULT 1,
  equipped_player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
