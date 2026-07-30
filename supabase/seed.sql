insert into public.teams (external_id, name, short_name, country, rating) values
  ('aurora', 'FC Aurora', 'FC', 'Brasil', 86), ('rio-bulls', 'Rio Bulls', 'RB', 'Brasil', 84), ('porto', 'Atlético Porto', 'AP', 'Brasil', 88)
on conflict (external_id) do update set name = excluded.name, rating = excluded.rating, updated_at = now();

insert into public.players (external_id, team_id, name, role, club_name, rating, price_cents, tier, is_extreme, stats, tags)
select p.external_id, t.id, p.name, p.role, p.club_name, p.rating, p.price_cents, p.tier, p.is_extreme, p.stats::jsonb, p.tags::jsonb
from (values
  ('p-001','aurora','L. Andrade','ATA','São Paulo FC',92,1240000,'extreme',true,'{"attack":94,"technique":88,"defence":91}','["Finalizador","Capitão"]'),
  ('p-002','porto','M. Costa','MEI','Atlético Porto',88,780000,'diamond',false,'{"attack":86,"technique":93,"defence":84}','["Passe longo"]'),
  ('p-003','rio-bulls','R. Nascimento','ZAG','Bahia United',84,520000,'gold',false,'{"attack":79,"technique":81,"defence":89}','["Marcação"]')
) as p(external_id, team_key, name, role, club_name, rating, price_cents, tier, is_extreme, stats, tags)
join public.teams t on t.external_id = p.team_key
on conflict (external_id) do update set rating = excluded.rating, price_cents = excluded.price_cents, updated_at = now();

insert into public.items (name, category, element, power, effect, price_cents, icon) values
  ('Chuteira Fênix', 'chuteira', 'fogo', 8, '+8 finalização no último terço', 190000, '♢'),
  ('Luva Maré Alta', 'luva', 'agua', 7, '+7 reflexo em bolas molhadas', 165000, '◒'),
  ('Colar Voltagem', 'colar', 'raio', 6, '+6 aceleração após roubar a bola', 135000, 'ϟ'),
  ('Touca Ventus', 'touca', 'vento', 5, '+5 resistência e pressão', 98000, '⌁'),
  ('Máscara Glacial', 'mascara', 'gelo', 9, '+9 marcação em duelos decisivos', 220000, '◉')
on conflict do nothing;
