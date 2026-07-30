insert into public.leagues (external_id, name, country, tier, club_count, is_premium) values
  ('brasileirao', 'Liga Brasileira', 'BR', 'standard', 20, false),
  ('premier', 'Inglaterra', 'GB', 'standard', 20, false),
  ('europe-elite', 'Europa Elite', 'EU', 'premium', 32, true)
on conflict (external_id) do update set name = excluded.name, updated_at = now();

insert into public.power_types (key, name, element, description, default_bonus) values
  ('fire-finisher', 'Fogo', 'fogo', 'Finalização e intensidade no último terço.', 8),
  ('water-reflex', 'Água', 'agua', 'Reflexos e controle em condições difíceis.', 7),
  ('lightning-burst', 'Raio', 'raio', 'Aceleração após recuperar a bola.', 6),
  ('wind-pressure', 'Vento', 'vento', 'Resistência e pressão alta.', 5),
  ('ice-duel', 'Gelo', 'gelo', 'Marcação em duelos decisivos.', 9)
on conflict (key) do update set default_bonus = excluded.default_bonus;

insert into public.stadiums (external_id, name, capacity, level, revenue_multiplier, visual) values
  ('aurora-stadium', 'Estádio Aurora', 42500, 6, 1.18, '{"accent":"teal","lights":true}')
on conflict (external_id) do update set capacity = excluded.capacity, level = excluded.level, updated_at = now();
