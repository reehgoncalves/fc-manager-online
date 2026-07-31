-- SQL Schema para FC Manager Online

-- Tabela de Usuários (Clubes)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_name TEXT NOT NULL,
    fc_coins INTEGER DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Compras (Loja)
CREATE TABLE public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    item_name TEXT NOT NULL,
    item_type TEXT NOT NULL, -- 'player' ou 'pack'
    price INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Plantel (Jogadores de um Usuário)
CREATE TABLE public.user_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    player_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    position TEXT NOT NULL,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Realtime para o Painel Admin escutar compras ao vivo
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchases;
