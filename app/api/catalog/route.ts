import { NextResponse } from "next/server";

export const revalidate = 900;

const avatarUrl = "/player-avatars.png";

type ProviderRecord = Record<string, any>;

async function apiFootballRequest(endpoint: string, params: Record<string, string>) {
  const baseUrl = process.env.FOOTBALL_DATA_PROVIDER_URL?.replace(/\/$/, "");
  const key = process.env.FOOTBALL_DATA_PROVIDER_KEY;
  if (!baseUrl || !key) return null;
  const query = new URLSearchParams(params);
  const response = await fetch(`${baseUrl}/${endpoint}?${query.toString()}`, {
    headers: { Accept: "application/json", "x-apisports-key": key },
    next: { revalidate: 900 },
  });
  if (!response.ok) return null;
  const payload = await response.json() as ProviderRecord;
  if (payload.errors && Object.keys(payload.errors).length > 0) return null;
  return payload;
}

function mapPlayerFromApi(row: ProviderRecord): ProviderRecord | null {
  if (!row.player?.id) return null;
  const statistics = row.statistics?.[0] ?? {};
  const games = statistics.games ?? {};
  const goals = statistics.goals ?? {};
  const passes = statistics.passes ?? {};
  const rating = Math.max(40, Math.min(99, Math.round(Number(games.rating ?? 60))));
  const tier = rating >= 90 ? "EXTREMO" : rating >= 85 ? "DIAMANTE" : rating >= 78 ? "OURO" : "PRATA";
  return {
    id: row.player.id,
    name: row.player.name ?? `${row.player.firstname ?? ""} ${row.player.lastname ?? ""}`.trim(),
    position: games.position === "Goalkeeper" ? "GOL" : games.position === "Defender" ? "ZAG" : games.position === "Attacker" ? "ATA" : "MEI",
    rating,
    avatar_url: row.player.photo ?? avatarUrl,
    color: tier === "EXTREMO" ? "coral" : tier === "DIAMANTE" ? "diamond" : tier === "OURO" ? "gold" : "silver",
    tag: tier,
    price: "0",
    team: statistics.team?.name ?? "Clube",
    nationality: row.player.nationality ?? null,
    age: row.player.age ?? null,
    stats: {
      goals: goals.total ?? 0,
      assists: goals.assists ?? passes.key ?? 0,
      appearances: games.appearences ?? 0,
      rating: Number(games.rating ?? 0).toFixed(1),
    },
  };
}

async function loadApiFootballCatalog() {
  const season = process.env.FOOTBALL_DATA_SEASON ?? "2024";
  const leagueIds = (process.env.FOOTBALL_DATA_LEAGUES ?? "71,39,140")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, Number(process.env.FOOTBALL_DATA_MAX_LEAGUES ?? 5));
  const maxPages = Number(process.env.FOOTBALL_DATA_MAX_PAGES ?? 3);
  const leagues: ProviderRecord[] = [];
  const teams: ProviderRecord[] = [];
  const players: ProviderRecord[] = [];

  for (const leagueId of leagueIds) {
    const [leaguePayload, teamPayload] = await Promise.all([
      apiFootballRequest("leagues", { id: leagueId, season }),
      apiFootballRequest("teams", { league: leagueId, season }),
    ]);
    const leagueRow = leaguePayload?.response?.[0];
    if (leagueRow?.league) {
      leagues.push({
        name: leagueRow.league.name,
        country: leagueRow.country?.code ?? "INT",
        flag_url: leagueRow.country?.flag ?? null,
        logo_url: leagueRow.league.logo ?? null,
        club_count: leagueRow.league.type === "League" ? 20 : 32,
        color: "green",
      });
    }
    for (const row of teamPayload?.response ?? []) {
      if (!row.team?.id) continue;
      teams.push({
        id: row.team.id,
        name: row.team.name,
        country: leagueRow?.country?.code ?? "INT",
        flag_url: leagueRow?.country?.flag ?? null,
        logo_url: row.team.logo ?? null,
      });
    }
    // Fetch multiple pages to get more players
    for (let page = 1; page <= maxPages; page++) {
      const playerPayload = await apiFootballRequest("players", { league: leagueId, season, page: String(page) });
      if (!playerPayload?.response?.length) break;
      for (const row of playerPayload.response) {
        const mapped = mapPlayerFromApi(row);
        if (mapped) players.push(mapped);
      }
      const totalPages = playerPayload.paging?.total ?? 1;
      if (page >= totalPages) break;
    }
  }

  if (!leagues.length && !teams.length && !players.length) return null;
  // Sort by rating descending so top players appear first
  players.sort((a, b) => b.rating - a.rating);
  return {
    ...localCatalog,
    source: "api-football",
    generatedAt: new Date().toISOString(),
    leagues,
    teams: teams.map((team) => team.name),
    teamAssets: teams.map((team) => ({ name: team.name, country: team.country, flagUrl: team.flag_url, logoUrl: team.logo_url })),
    players,
  };
}

/* ────────────────────────────────────────────
 * Star players — real-world data for the landing page showcase.
 * These are used as fallback when the API-Football provider is not configured.
 * Photos come from API-Football CDN (public player thumbnails).
 * ──────────────────────────────────────────── */
const starPlayers = [
  { id: 154, name: "L. Messi", position: "ATA", rating: 93, image: "portrait-a", avatar_url: "https://media.api-sports.io/football/players/154.png", color: "coral", tag: "EXTREMO", price: "58.000", team: "Inter Miami", nationality: "Argentina", stats: { goals: 23, assists: 13, appearances: 25, rating: "8.7" } },
  { id: 874, name: "C. Ronaldo", position: "ATA", rating: 91, image: "portrait-b", avatar_url: "https://media.api-sports.io/football/players/874.png", color: "coral", tag: "EXTREMO", price: "52.000", team: "Al Nassr", nationality: "Portugal", stats: { goals: 35, assists: 11, appearances: 31, rating: "8.4" } },
  { id: 276, name: "Neymar Jr", position: "ATA", rating: 89, image: "portrait-c", avatar_url: "https://media.api-sports.io/football/players/276.png", color: "coral", tag: "EXTREMO", price: "38.000", team: "Santos FC", nationality: "Brasil", stats: { goals: 8, assists: 6, appearances: 15, rating: "8.1" } },
  { id: 278, name: "K. Mbappé", position: "ATA", rating: 93, image: "portrait-a", avatar_url: "https://media.api-sports.io/football/players/278.png", color: "coral", tag: "EXTREMO", price: "72.000", team: "Real Madrid", nationality: "França", stats: { goals: 27, assists: 10, appearances: 36, rating: "8.6" } },
  { id: 1100, name: "Vinícius Jr", position: "ATA", rating: 92, image: "portrait-b", avatar_url: "https://media.api-sports.io/football/players/1100.png", color: "coral", tag: "EXTREMO", price: "68.000", team: "Real Madrid", nationality: "Brasil", stats: { goals: 24, assists: 11, appearances: 38, rating: "8.5" } },
  { id: 1466, name: "E. Haaland", position: "ATA", rating: 93, image: "portrait-c", avatar_url: "https://media.api-sports.io/football/players/1466.png", color: "coral", tag: "EXTREMO", price: "74.000", team: "Man City", nationality: "Noruega", stats: { goals: 38, assists: 5, appearances: 35, rating: "8.8" } },
  { id: 10009, name: "J. Bellingham", position: "MEI", rating: 90, image: "portrait-a", avatar_url: "https://media.api-sports.io/football/players/10009.png", color: "coral", tag: "EXTREMO", price: "62.000", team: "Real Madrid", nationality: "Inglaterra", stats: { goals: 19, assists: 6, appearances: 34, rating: "8.3" } },
  { id: 629, name: "K. De Bruyne", position: "MEI", rating: 91, image: "portrait-b", avatar_url: "https://media.api-sports.io/football/players/629.png", color: "coral", tag: "EXTREMO", price: "55.000", team: "Man City", nationality: "Bélgica", stats: { goals: 7, assists: 18, appearances: 26, rating: "8.5" } },
  { id: 306, name: "M. Salah", position: "ATA", rating: 90, image: "portrait-c", avatar_url: "https://media.api-sports.io/football/players/306.png", color: "coral", tag: "EXTREMO", price: "48.000", team: "Liverpool", nationality: "Egito", stats: { goals: 25, assists: 14, appearances: 37, rating: "8.4" } },
  { id: 521, name: "L. Modric", position: "MEI", rating: 88, image: "portrait-a", avatar_url: "https://media.api-sports.io/football/players/521.png", color: "diamond", tag: "DIAMANTE", price: "28.000", team: "Real Madrid", nationality: "Croácia", stats: { goals: 4, assists: 12, appearances: 33, rating: "8.0" } },
  { id: 186, name: "Rodri", position: "VOL", rating: 91, image: "portrait-b", avatar_url: "https://media.api-sports.io/football/players/186.png", color: "coral", tag: "EXTREMO", price: "56.000", team: "Man City", nationality: "Espanha", stats: { goals: 8, assists: 9, appearances: 34, rating: "8.3" } },
  { id: 762, name: "R. Lewandowski", position: "ATA", rating: 90, image: "portrait-c", avatar_url: "https://media.api-sports.io/football/players/762.png", color: "coral", tag: "EXTREMO", price: "42.000", team: "Barcelona", nationality: "Polônia", stats: { goals: 26, assists: 8, appearances: 34, rating: "8.2" } },
];

const localCatalog = {
  source: "local-catalog-api",
  generatedAt: "seed",
  players: starPlayers.map((p) => ({
    ...p,
    avatarUrl: p.avatar_url,
  })),
  teams: ["Real Madrid", "Man City", "Barcelona", "Liverpool", "Inter Miami", "Santos FC", "Al Nassr", "Bayern Munich"],
  teamAssets: [
    { name: "Real Madrid", country: "ES", flagUrl: "https://flagcdn.com/w40/es.png", logoUrl: "https://media.api-sports.io/football/teams/541.png" },
    { name: "Man City", country: "GB", flagUrl: "https://flagcdn.com/w40/gb.png", logoUrl: "https://media.api-sports.io/football/teams/50.png" },
    { name: "Barcelona", country: "ES", flagUrl: "https://flagcdn.com/w40/es.png", logoUrl: "https://media.api-sports.io/football/teams/529.png" },
    { name: "Liverpool", country: "GB", flagUrl: "https://flagcdn.com/w40/gb.png", logoUrl: "https://media.api-sports.io/football/teams/40.png" },
    { name: "Inter Miami", country: "US", flagUrl: "https://flagcdn.com/w40/us.png", logoUrl: "https://media.api-sports.io/football/teams/14312.png" },
    { name: "Santos FC", country: "BR", flagUrl: "https://flagcdn.com/w40/br.png", logoUrl: "https://media.api-sports.io/football/teams/128.png" },
    { name: "Al Nassr", country: "SA", flagUrl: "https://flagcdn.com/w40/sa.png", logoUrl: "https://media.api-sports.io/football/teams/2939.png" },
    { name: "Bayern Munich", country: "DE", flagUrl: "https://flagcdn.com/w40/de.png", logoUrl: "https://media.api-sports.io/football/teams/157.png" },
  ],
  leagues: [
    { name: "La Liga", country: "ES", flagUrl: "https://flagcdn.com/w40/es.png", clubs: "20 clubes", color: "red", featured: true },
    { name: "Premier League", country: "GB", flagUrl: "https://flagcdn.com/w40/gb.png", clubs: "20 clubes", color: "blue" },
    { name: "Brasileirão", country: "BR", flagUrl: "https://flagcdn.com/w40/br.png", clubs: "20 clubes", color: "green" },
    { name: "Champions League", country: "EU", clubs: "32 clubes", color: "purple", paid: true },
  ],
  items: [
    { name: "Chuteira Fênix", slot: "Chuteira", power: "Fogo", bonus: 8, rarity: "Extremo" },
    { name: "Luva Maré Alta", slot: "Luva", power: "Água", bonus: 7, rarity: "Diamante" },
    { name: "Colar Voltagem", slot: "Colar", power: "Raio", bonus: 6, rarity: "Ouro" },
    { name: "Touca Ventus", slot: "Touca", power: "Vento", bonus: 5, rarity: "Ouro" },
    { name: "Máscara Glacial", slot: "Máscara", power: "Gelo", bonus: 9, rarity: "Extremo" },
  ],
  powerTypes: [
    { name: "Fogo", color: "#ff755e", description: "Mais pressão e finalização no terço final." },
    { name: "Água", color: "#62c8ff", description: "Recuperação e controle em partidas longas." },
    { name: "Raio", color: "#f6d76b", description: "Aceleração para transições rápidas." },
    { name: "Vento", color: "#9de4c0", description: "Mobilidade e leitura de espaços." },
    { name: "Gelo", color: "#b4c9ff", description: "Concentração em momentos decisivos." },
  ],
  stadiums: [{
    name: "Estádio Aurora",
    capacity: "42.500",
    level: "24",
    upgrades: [
      { name: "Arquibancada norte", level: "Nível 06", value: "18.000", progress: 82, icon: "▥", tone: "mint" },
      { name: "Centro de treinamento", level: "Nível 04", value: "12.500", progress: 54, icon: "♙", tone: "purple" },
      { name: "Centro médico", level: "Nível 03", value: "8.900", progress: 31, icon: "✚", tone: "coral" },
    ],
  }],
  standings: [
    { rank: 1, team: "Real Madrid", country: "ES", flagUrl: "https://flagcdn.com/w40/es.png", played: 38, win: 29, points: 90, form: ["w", "w", "w", "w", "w"] },
    { rank: 2, team: "Barcelona", country: "ES", flagUrl: "https://flagcdn.com/w40/es.png", played: 38, win: 26, points: 85, form: ["w", "w", "d", "w", "w"] },
    { rank: 3, team: "Man City", country: "GB", flagUrl: "https://flagcdn.com/w40/gb.png", played: 38, win: 28, points: 89, form: ["w", "w", "d", "w", "d"] },
    { rank: 4, team: "Liverpool", country: "GB", flagUrl: "https://flagcdn.com/w40/gb.png", played: 38, win: 24, points: 78, form: ["w", "d", "w", "l", "w"] },
    { rank: 5, team: "Bayern Munich", country: "DE", flagUrl: "https://flagcdn.com/w40/de.png", played: 34, win: 23, points: 72, form: ["d", "w", "l", "w", "w"] },
    { rank: 6, team: "Inter Miami", country: "US", flagUrl: "https://flagcdn.com/w40/us.png", played: 30, win: 18, points: 58, form: ["l", "w", "d", "w", "l"] },
  ],
  managerPoints: 9450,
  globalRank: 3,
  onlineManagers: 1248,
  news: [
    { id: "news-1", kind: "oferta", title: "Proposta por Vinícius Jr recebida", detail: "Oferta de 68.000 FC · decisão pendente", time: "agora", team: "Real Madrid", country: "ES" },
    { id: "news-2", kind: "partida", title: "Seu próximo jogo foi confirmado", detail: "FC Aurora x Real Madrid · domingo, 20:30", time: "há 8 min", team: "FC Aurora", country: "BR" },
    { id: "news-3", kind: "trofeu", title: "Conquista desbloqueada", detail: "Invicto em casa · +250 pontos", time: "há 1 h", team: "FC Aurora", country: "BR" },
  ],
  achievements: [
    { name: "Olheiro global", description: "Contrate atletas de 3 países", progress: 2, total: 3, icon: "◉", tone: "mint" },
    { name: "Casa forte", description: "Vença 10 partidas em casa", progress: 8, total: 10, icon: "▦", tone: "gold" },
    { name: "Colecionador", description: "Equipe 5 itens especiais", progress: 3, total: 5, icon: "✦", tone: "coral" },
  ],
  trophies: [
    { name: "Copa Aurora", season: "Temporada 06", icon: "♛", tone: "gold" },
    { name: "Liga dos Managers", season: "Temporada 05", icon: "◇", tone: "diamond" },
    { name: "Supertaça", season: "Temporada 04", icon: "✦", tone: "coral" },
  ],
};

export async function GET() {
  const upstream = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

  if (upstream) {
    try {
      const response = await fetch(`${upstream}/api/v1/catalog`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 30 },
      });
      if (response.ok) {
        const data = await response.json() as Record<string, unknown>;
        const unwrap = (value: unknown) => Array.isArray(value) ? value as Array<Record<string, unknown>> : (value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data) ? (value as { data: Array<Record<string, unknown>> }).data : []);
        const rawPlayers = unwrap(data.players);
        const rawTeams = unwrap(data.teams);
        const rawLeagues = unwrap(data.leagues);
        const rawItems = unwrap(data.items);
        const normalizedPlayers = rawPlayers.map((player, index) => ({
          ...player,
          id: player.id ?? index + 1,
          position: player.position ?? player.role ?? "MEI",
          image: player.image ?? "portrait-a",
          avatarUrl: player.avatarUrl ?? player.avatar_url ?? player.photo ?? player.image_url ?? avatarUrl,
          color: player.color ?? (player.tier === "extreme" ? "coral" : player.tier === "diamond" ? "diamond" : player.tier === "gold" ? "gold" : "silver"),
          tag: player.tag ?? String(player.tier ?? "PRATA").toUpperCase(),
          price: player.price ?? (player.price_fc ? Number(player.price_fc).toLocaleString("pt-BR") : String(player.price_cents ?? 0)),
          team: typeof player.team === "object" && player.team !== null ? String((player.team as { name?: unknown }).name ?? player.club_name ?? "FC Aurora") : String(player.team ?? player.club_name ?? "FC Aurora"),
        }));
        const normalizedTeams = rawTeams.map((team) => ({ id: team.id, name: team.name ?? "Clube", country: team.country ?? "INT", flagUrl: team.flagUrl ?? team.flag_url ?? null, logoUrl: team.logoUrl ?? team.logo_url ?? null }));
        const normalizedLeagues = rawLeagues.map((league) => ({ name: league.name ?? "Liga", country: league.country ?? "INT", flagUrl: league.flagUrl ?? league.flag_url ?? null, clubs: `${league.club_count ?? league.clubs ?? 20} clubes`, color: league.color ?? "green", paid: Boolean(league.is_premium ?? league.paid) }));
        const normalizedItems = rawItems.map((item, index) => ({ id: item.id ?? index + 1, name: item.name ?? "Item", slot: item.slot ?? item.category ?? "Item", power: item.power_type ?? item.element ?? "Fogo", bonus: Number(item.bonus ?? item.power ?? 1), price_fc: Number(item.price_fc ?? 0), rarity: item.rarity ?? "Ouro", effect: item.effect ?? "Poder especial" }));
        return NextResponse.json({ ...data, players: normalizedPlayers, teams: normalizedTeams.map((team) => team.name), teamAssets: normalizedTeams, leagues: normalizedLeagues, items: normalizedItems, source: "laravel-api" }, {
          headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" },
        });
      }
    } catch {
      // The local catalog keeps the UI usable while the provider/API recovers.
    }
  }

  if (process.env.FOOTBALL_DATA_PROVIDER === "api-football") {
    try {
      const providerCatalog = await loadApiFootballCatalog();
      if (providerCatalog) {
        return NextResponse.json(providerCatalog, {
          headers: { "Cache-Control": "public, max-age=900, stale-while-revalidate=1800" },
        });
      }
    } catch {
      // Preserve the playable local catalog if the provider is unavailable or quota-limited.
    }
  }

  return NextResponse.json({ ...localCatalog, generatedAt: new Date().toISOString() }, {
    headers: { "Cache-Control": "public, max-age=900, stale-while-revalidate=1800" },
  });
}
