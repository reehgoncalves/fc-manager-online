"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type PointerEvent, useEffect, useRef, useState } from "react";

const nav = [
  ["/career", "⌂", "Carreira"],
  ["/choose-league", "◈", "Escolher liga"],
  ["/lineup", "♙", "Escalação"],
  ["/live-match", "◉", "Partida ao vivo"],
  ["/transfer-list", "↗", "Transferências"],
  ["/standings", "♛", "Classificação"],
  ["/stadium", "▦", "Estádio"],
] as const;

type GamePlayer = {
  id?: number;
  name: string;
  position: string;
  rating: number;
  image: string;
  color: string;
  tag: string;
  price: string;
  team?: string;
  avatarUrl?: string;
};

type LeagueRecord = { name: string; country: string; flagUrl?: string; clubs: string; color: string; featured?: boolean; paid?: boolean };
type StandingRow = { rank: number; team: string; country?: string; flagUrl?: string; played: number; win: number; points: number; form: string[] };
type PortalNews = { id: string; kind: string; title: string; detail: string; time: string; team: string; country: string; flagUrl?: string };
type PortalAchievement = { name: string; description: string; progress: number; total: number; icon: string; tone: string };
type PortalTrophy = { name: string; season: string; icon: string; tone: string };
type Catalog = {
  source: string;
  generatedAt: string;
  players: GamePlayer[];
  teams: string[];
  teamAssets: { id?: number | string; name: string; country: string; flagUrl?: string }[];
  leagues: LeagueRecord[];
  items: { name: string; slot: string; power: string; bonus: number; rarity: string }[];
  powerTypes: { name: string; color: string; description: string }[];
  stadiums: { name: string; capacity: string; level: string; upgrades: { name: string; level: string; value: string; progress: number; icon: string; tone: string }[] }[];
  standings: StandingRow[];
  managerPoints: number;
  globalRank: number;
  onlineManagers: number;
  news: PortalNews[];
  achievements: PortalAchievement[];
  trophies: PortalTrophy[];
};

const players: GamePlayer[] = [
  { id: 1, name: "L. Andrade", position: "ATA", rating: 92, image: "portrait-a", color: "coral", tag: "EXTREMO", price: "12.400" },
  { id: 2, name: "M. Costa", position: "MEI", rating: 88, image: "portrait-b", color: "diamond", tag: "DIAMANTE", price: "7.800" },
  { id: 3, name: "R. Nascimento", position: "ZAG", rating: 84, image: "portrait-c", color: "gold", tag: "OURO", price: "5.200" },
  { id: 4, name: "E. Vidal", position: "GOL", rating: 81, image: "portrait-d", color: "silver", tag: "PRATA", price: "3.950" },
];

const catalogLeagues: LeagueRecord[] = [
  { name: "Brasil", country: "BR", flagUrl: "https://flagcdn.com/w40/br.png", clubs: "20 clubes", color: "green", featured: true },
  { name: "Inglaterra", country: "GB", flagUrl: "https://flagcdn.com/w40/gb.png", clubs: "20 clubes", color: "blue" },
  { name: "Espanha", country: "ES", flagUrl: "https://flagcdn.com/w40/es.png", clubs: "20 clubes", color: "red" },
  { name: "Europa Elite", country: "EU", clubs: "32 clubes", color: "purple", paid: true },
];

const catalogStandings: StandingRow[] = [
  { rank: 1, team: "São Paulo Kings", country: "BR", flagUrl: "https://flagcdn.com/w40/br.png", played: 18, win: 14, points: 44, form: ["w", "w", "w", "w", "w"] },
  { rank: 2, team: "Porto Legends", country: "PT", flagUrl: "https://flagcdn.com/w40/pt.png", played: 18, win: 13, points: 41, form: ["w", "w", "d", "w", "w"] },
  { rank: 3, team: "FC Aurora", country: "BR", flagUrl: "https://flagcdn.com/w40/br.png", played: 18, win: 12, points: 38, form: ["w", "w", "d", "w", "d"] },
  { rank: 4, team: "Rio Bulls", country: "BR", flagUrl: "https://flagcdn.com/w40/br.png", played: 18, win: 10, points: 34, form: ["w", "d", "w", "l", "w"] },
  { rank: 5, team: "Bahia United", country: "BR", flagUrl: "https://flagcdn.com/w40/br.png", played: 18, win: 9, points: 31, form: ["d", "w", "l", "w", "w"] },
  { rank: 6, team: "Mineiro Club", country: "BR", flagUrl: "https://flagcdn.com/w40/br.png", played: 18, win: 8, points: 28, form: ["l", "w", "d", "w", "l"] },
];

const catalogFallback: Catalog = {
  source: "local-seed",
  generatedAt: "local",
  players,
  teams: ["FC Aurora", "São Paulo Kings", "Porto Legends", "Rio Bulls", "Bahia United", "Mineiro Club"],
  teamAssets: [
    { name: "FC Aurora", country: "BR", flagUrl: "https://flagcdn.com/w40/br.png" },
    { name: "São Paulo Kings", country: "BR", flagUrl: "https://flagcdn.com/w40/br.png" },
    { name: "Porto Legends", country: "PT", flagUrl: "https://flagcdn.com/w40/pt.png" },
    { name: "Rio Bulls", country: "BR", flagUrl: "https://flagcdn.com/w40/br.png" },
    { name: "Bahia United", country: "BR", flagUrl: "https://flagcdn.com/w40/br.png" },
    { name: "Mineiro Club", country: "BR", flagUrl: "https://flagcdn.com/w40/br.png" },
  ],
  leagues: catalogLeagues,
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
  standings: catalogStandings,
  managerPoints: 9450,
  globalRank: 3,
  onlineManagers: 1248,
  news: [],
  achievements: [],
  trophies: [],
};

type ApiState = "syncing" | "live" | "fallback";

type ManagerSession = { name?: string; email?: string; role?: string; team?: { name?: string }; wallet?: { balance?: number } };

function parseCoins(value: string | number | undefined) {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  return Number(digits) || 0;
}

function formatCoins(value: number) {
  return value.toLocaleString("pt-BR");
}

function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog>(catalogFallback);
  const [apiState, setApiState] = useState<ApiState>("syncing");

  useEffect(() => {
    let active = true;
    fetch("/api/catalog", { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
        return response.json() as Promise<Partial<Catalog>>;
      })
      .then((remoteCatalog) => {
        if (!active) return;
        setCatalog({ ...catalogFallback, ...remoteCatalog });
        setApiState("live");
      })
      .catch(() => {
        if (active) setApiState("fallback");
      });
    return () => { active = false; };
  }, []);

  return { catalog, apiState };
}

function ApiStatus({ state }: { state: ApiState }) {
  const label = state === "live" ? "API sincronizada" : state === "syncing" ? "Sincronizando API" : "Modo seguro";
  return <span className={`api-status ${state}`}><i /> {label}</span>;
}

function useManagerIdentity() {
  const [identity, setIdentity] = useState<ManagerSession>({ name: "Bruno Mendes" });
  useEffect(() => {
    fetch("/api/auth/me", { headers: { Accept: "application/json" } }).then((response) => response.ok ? response.json() as Promise<{ user: ManagerSession }> : Promise.reject(new Error("anonymous"))).then((payload) => setIdentity(payload.user)).catch(() => undefined);
  }, []);
  const name = identity.name || "Bruno Mendes";
  return { name, club: identity.team?.name || "FC Aurora", coins: identity.wallet?.balance ?? 0, initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() };
}

async function signOutManager() {
  await fetch("/api/auth/logout", { method: "POST", headers: { Accept: "application/json" } }).catch(() => undefined);
  window.localStorage.setItem("fc-manager-logout-notice", "Você saiu da sua conta com segurança.");
  window.location.assign("/login");
}

function GameNav() {
  const pathname = usePathname();
  const identity = useManagerIdentity();
  return <aside className="game-sidebar"><Link className="game-brand" href="/career"><span className="brand-mark">FC</span><span>FC <b>MANAGER</b></span><i>ONLINE</i></Link><div className="game-club"><span className="club-crest">FC</span><div><strong>{identity.club}</strong><small>Manager · Nível 24</small></div><span>⌄</span></div><nav className="game-nav" aria-label="Menu do jogo">{nav.map(([href, icon, label]) => <Link className={pathname === href ? "active" : ""} href={href} key={href}><span>{icon}</span>{label}</Link>)}</nav><div className="game-sidebar-bottom"><div className="game-help"><span>?</span><div><strong>Central do manager</strong><small>Dicas, regras e suporte</small></div></div><button className="game-profile game-logout" onClick={signOutManager} type="button"><span className="user-avatar">{identity.initials}</span><div><strong>{identity.name}</strong><small>Sair da conta</small></div><span>↪</span></button></div></aside>;
}

function GameTopbar({ title, kicker }: { title: string; kicker: string }) {
  const identity = useManagerIdentity();
  const [coins, setCoins] = useState(24850);
  useEffect(() => {
    if (identity.coins) setCoins(identity.coins);
  }, [identity.coins]);
  return <header className="game-topbar"><div className="game-topbar-title"><span className="eyebrow">{kicker}</span><h1>{title}</h1></div><div className="game-top-actions"><span className="game-season-pill"><i /> Temporada 07 <b>62%</b></span><span className="game-coins">◈ <b>{formatCoins(coins)}</b> FC</span><button aria-label="Notificações" type="button">♢<i /></button><span className="game-avatar" title={identity.name}>{identity.initials}</span></div></header>;
}

export function GameFrame({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) {
  const [sessionReady, setSessionReady] = useState(false);
  useEffect(() => {
    fetch("/api/auth/me", { headers: { Accept: "application/json" } }).then((response) => { if (!response.ok) throw new Error("anonymous"); setSessionReady(true); }).catch(() => window.location.assign("/login"));
  }, []);
  if (!sessionReady) return <main className="session-loading"><span className="brand-mark">FC</span><p>Validando sua carreira...</p></main>;
  return <main className="game-app"><GameNav /><div className="game-main"><GameTopbar title={title} kicker={kicker} /><div className="game-content">{children}</div><footer className="game-footer"><span>FC MANAGER ONLINE · Temporada 07</span><span><Link href="/">Página inicial</Link> · <button className="footer-logout" onClick={signOutManager} type="button">Sair</button></span></footer></div></main>;
}

function Portrait({ player, size = "normal" }: { player: GamePlayer; size?: "normal" | "small" }) { return <span className={`realistic-portrait ${player.image} ${size} ${player.avatarUrl ? "has-avatar" : ""}`} style={player.avatarUrl ? { backgroundImage: `url(${player.avatarUrl})` } : undefined} aria-hidden="true" />; }

function PlayerCard({ player, onClick }: { player: typeof players[number]; onClick?: () => void }) {
  return <button className={`real-card tier-${player.color}`} onClick={onClick} type="button"><span className="real-card-glow" /><span className="real-card-rating">{player.rating}</span><span className="real-card-position">{player.position}</span><Portrait player={player} /><span className="real-card-name">{player.name}</span><span className="real-card-club">{player.team ?? "FC Aurora"} · Brasil</span><span className="real-card-bottom"><b>{player.tag}</b><span>{player.price} FC</span></span></button>;
}

export function CareerScreen() {
  const { catalog, apiState } = useCatalog();
  return <GameFrame title="Sua carreira" kicker="CENTRO DA CARREIRA"><section className="career-hero"><div className="career-hero-backdrop" /><div className="career-hero-copy"><span className="eyebrow">TEMPORADA 07 · JORNADA DO MANAGER</span><h2>O próximo capítulo<br /><em>é seu.</em></h2><p>Escolha uma liga, assuma o comando e leve seu clube ao topo. Cada contratação, formação e upgrade conta.</p><div className="career-hero-actions"><Link className="primary-game-button" href="/choose-league">Começar uma carreira <span>→</span></Link><Link className="text-game-button" href="/lineup">Continuar carreira <span>↗</span></Link></div></div><div className="career-streak"><span>SEU MOMENTO</span><strong>4</strong><small>jogos sem perder</small><div><i /><i /><i /><i className="draw" /></div></div></section><section className="game-section-heading"><div><span className="eyebrow">VISÃO DA CARREIRA</span><h2>O seu universo de futebol</h2></div><span className="game-muted"><ApiStatus state={apiState} /> · {catalog.teams.length} clubes catalogados</span></section><div className="career-grid"><Link className="career-tile tile-league" href="/choose-league"><span className="tile-number">01</span><span className="tile-icon">◈</span><h3>Escolha seu desafio</h3><p>Entre em uma liga nacional, continental ou crie um mundo só seu.</p><b>Explorar ligas <span>→</span></b></Link><Link className="career-tile tile-lineup" href="/lineup"><span className="tile-number">02</span><span className="tile-icon">♙</span><h3>Prepare o onze</h3><p>Monte sua escalação, defina o estilo e surpreenda seu próximo adversário.</p><b>Montar escalação <span>→</span></b></Link><Link className="career-tile tile-stadium" href="/stadium"><span className="tile-number">03</span><span className="tile-icon">▦</span><h3>Faça sua casa crescer</h3><p>Melhore o estádio, o centro de treino e transforme seu clube em uma potência.</p><b>Ver estádio <span>→</span></b></Link></div><section className="game-section-heading cards-heading"><div><span className="eyebrow">SEU ELENCO</span><h2>Craques em destaque</h2></div><Link className="text-game-button" href="/transfer-list">Ver mercado completo →</Link></section><div className="real-card-row">{catalog.players.slice(0, 3).map((player) => <PlayerCard key={player.name} player={player} />)}</div><section className="career-social-grid"><article className="game-panel career-news"><div className="game-section-heading compact"><div><span className="eyebrow">CENTRAL DO CLUBE</span><h2>Notícias do mercado</h2></div><ApiStatus state={apiState} /></div>{catalog.news.length ? catalog.news.map((news) => <div className="career-news-row" key={news.id}><span className={`news-kind ${news.kind}`}>{news.kind === "oferta" ? "↗" : news.kind === "partida" ? "◉" : "✦"}</span><div><strong>{news.title}</strong><small>{news.detail}</small><span>{news.country} · {news.team} · {news.time}</span></div></div>) : <p className="game-muted">As notícias aparecem aqui quando o mercado se movimentar.</p>}</article><article className="game-panel career-achievements"><div className="game-section-heading compact"><div><span className="eyebrow">CONQUISTAS & TROFÉUS</span><h2>Sua coleção</h2></div><strong className="career-points">{catalog.managerPoints.toLocaleString("pt-BR")} pts</strong></div><div className="career-achievement-grid">{catalog.achievements.length ? catalog.achievements.map((achievement) => <div className="career-achievement" key={achievement.name}><span className={`achievement-icon ${achievement.tone}`}>{achievement.icon}</span><strong>{achievement.name}</strong><small>{achievement.progress}/{achievement.total} · {achievement.description}</small><div className="achievement-track"><span style={{ width: `${Math.min(100, (achievement.progress / achievement.total) * 100)}%` }} /></div></div>) : <p className="game-muted">Sincronizando suas conquistas.</p>}</div><div className="career-trophies">{catalog.trophies.map((trophy) => <span className={`trophy-chip ${trophy.tone}`} key={trophy.name} title={`${trophy.name} · ${trophy.season}`}>{trophy.icon}</span>)}</div></article></section></GameFrame>;
}

export function ChooseLeagueScreen() {
  const [selected, setSelected] = useState("Brasil");
  const [selectedTeam, setSelectedTeam] = useState("FC Aurora");
  const [coins, setCoins] = useState(24850);
  const [notice, setNotice] = useState("");
  const { catalog } = useCatalog();
  const leagues = catalog.leagues;
  const teams = catalog.teamAssets.length ? catalog.teamAssets : catalogFallback.teamAssets;
  const teamPrices: Record<string, number> = { "FC Aurora": 0, "Mineiro Club": 3200, "Rio Bulls": 5500, "Bahia United": 6000, "São Paulo Kings": 4500, "Porto Legends": 7500 };

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", { headers: { Accept: "application/json" } }).then((response) => response.ok ? response.json() as Promise<{ user?: { team?: { name?: string }; wallet?: { balance?: number } }; wallet?: { balance?: number } }> : Promise.reject(new Error("account unavailable"))),
    ]).then(([payload]) => { if (payload.user?.team?.name) setSelectedTeam(payload.user.team.name); setCoins(payload.wallet?.balance ?? payload.user?.wallet?.balance ?? 0); }).catch(() => setNotice("API indisponível: a escolha de clube não pode ser confirmada."));
  }, []);

  function chooseTeam(teamName: string) {
    setSelectedTeam(teamName);
    setNotice("");
  }

  function confirmTeam() {
    const cost = teamPrices[selectedTeam] ?? 3500;
    if (cost > coins) {
      setNotice("Saldo insuficiente. Escolha um clube mais acessível ou compre mais FC.");
      return;
    }
    const selectedAsset = teams.find((team) => team.name === selectedTeam);
    if (!selectedAsset?.id) { setNotice("Este catálogo é apenas uma apresentação. Sincronize a API para comprar o clube."); return; }
    fetch(`/api/game/v1/teams/${selectedAsset.id}/choose`, { method: "PUT", headers: { Accept: "application/json", "Content-Type": "application/json", "Idempotency-Key": `team-${selectedAsset.id}-${crypto.randomUUID()}` } }).then(async (response) => { const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.message || "Não foi possível confirmar o clube."); return payload; }).then(() => window.location.assign("/career")).catch((error: Error) => setNotice(error.message));
  }

  return <GameFrame title="Escolher liga" kicker="NOVA CARREIRA"><div className="choice-layout"><div><div className="choice-intro"><span className="eyebrow">PASSO 01 · O MUNDO É SEU</span><h2>Onde sua história<br /><em>vai começar?</em></h2><p>Escolha uma competição para assumir o controle. Você poderá comprar slots premium com FC coins e desbloquear clubes especiais.</p></div><div className="league-grid">{leagues.map((league) => <button className={`league-card ${league.color} ${selected === league.name ? "selected" : ""}`} key={league.name} onClick={() => setSelected(league.name)} type="button"><span className="league-flag">{league.flagUrl ? <img src={league.flagUrl} alt={`Bandeira de ${league.name}`} /> : league.country}</span><span className="league-visual">{league.name === "Brasil" ? "✦" : league.name === "Inglaterra" ? "◈" : league.name === "Espanha" ? "◉" : "♛"}</span>{league.paid && <span className="premium-ribbon">PREMIUM · 900 FC</span>}<strong>{league.name}</strong><small>{league.clubs} · {league.paid ? "Temporada especial" : "Aberta"}</small><span className="league-check">{selected === league.name ? "✓" : "→"}</span></button>)}</div><div className="team-choice-block"><div className="team-choice-heading"><div><span className="eyebrow">PASSO 02 · SEU CLUBE</span><h3>Escolha uma camisa para começar</h3></div><span className="choice-balance">◈ {formatCoins(coins)} FC</span></div><div className="team-choice-grid">{teams.map((team) => { const price = teamPrices[team.name] ?? 3500; return <button className={`team-choice ${selectedTeam === team.name ? "selected" : ""}`} key={team.name} onClick={() => chooseTeam(team.name)} type="button"><span className="team-choice-crest">{team.flagUrl ? <img src={team.flagUrl} alt={`Bandeira de ${team.name}`} /> : "FC"}</span><span><strong>{team.name}</strong><small>{team.country} · {price ? `${formatCoins(price)} FC` : "Clube inicial gratuito"}</small></span><b>{selectedTeam === team.name ? "✓" : "→"}</b></button>; })}</div></div></div><aside className="choice-summary"><span className="eyebrow">SUA ESCOLHA</span><div className="choice-crest">{leagues.find((league) => league.name === selected)?.country}</div><h3>{selectedTeam}</h3><p>Você começará na liga <b>{selected}</b> com elenco base. Clubes especiais usam as moedas da sua carteira.</p><div className="choice-benefits"><span>✓ Mercado de transferências</span><span>✓ Ranking da temporada</span><span>✓ Estádio nível 01</span></div><button className="primary-game-button wide" onClick={confirmTeam} type="button">{teamPrices[selectedTeam] ? `Comprar por ${formatCoins(teamPrices[selectedTeam])} FC` : `Começar com ${selectedTeam}`} <span>→</span></button>{notice && <small className="choice-notice">{notice}</small>}<small>O clube e o saldo ficam salvos nesta sessão.</small></aside></div></GameFrame>;
}

export function LineupScreen() {
  const [formation, setFormation] = useState("4-3-3");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const { catalog, apiState } = useCatalog();
  const lineupPlayers = catalog.players.length ? catalog.players : players;
  const [positions, setPositions] = useState(() => [{ name: "E. Vidal", pos: "GOL", x: 50, y: 88, player: lineupPlayers[3] }, { name: "R. Nascimento", pos: "ZAG", x: 35, y: 69, player: lineupPlayers[2] }, { name: "D. Souza", pos: "ZAG", x: 65, y: 69, player: lineupPlayers[2] }, { name: "J. Lima", pos: "LD", x: 82, y: 65, player: lineupPlayers[1] }, { name: "N. Melo", pos: "VOL", x: 50, y: 49, player: lineupPlayers[1] }, { name: "M. Costa", pos: "MEI", x: 34, y: 38, player: lineupPlayers[1] }, { name: "L. Andrade", pos: "ATA", x: 50, y: 16, player: lineupPlayers[0] }, { name: "T. Lima", pos: "PD", x: 76, y: 26, player: lineupPlayers[0] }]);
  useEffect(() => {
    if (catalog.players.length < 8 || positions.length >= 11) return;
    const layout = [["GOL", 50, 88], ["ZAG", 35, 69], ["ZAG", 65, 69], ["LD", 82, 65], ["VOL", 50, 49], ["MEI", 34, 38], ["MEI", 66, 38], ["ATA", 50, 16], ["PD", 76, 26], ["PE", 24, 26], ["ATA", 50, 7]] as const;
    setPositions(layout.map(([pos, x, y], index) => ({ name: catalog.players[index].name, pos, x, y, player: catalog.players[index] })));
  }, [catalog.players, positions.length]);
  async function saveLineup() {
    const response = await fetch("/api/game/v1/lineups/aurora-07", { method: "PUT", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ formation, tactic: "high_press", players: positions.filter((position) => position.player.id).map((position) => ({ player_id: position.player.id, position: position.pos, role: position.name, x: position.x, y: position.y })) }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { setSaved(false); setNotice(payload.message || "Não foi possível salvar a escalação na API."); return; }
    setSaved(true);
    setNotice("Escalação sincronizada com a API.");
  }

  function moveDragged(event: PointerEvent<HTMLDivElement>) {
    if (dragging === null) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 8, 92);
    const y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 8, 92);
    setPositions((current) => current.map((position, index) => index === dragging ? { ...position, x, y } : position));
  }
  return <GameFrame title="Escalação" kicker="PRÓXIMA PARTIDA · DOM 20:30"><div className="lineup-toolbar"><div><h2>FC Aurora <span>vs.</span> Rio Bulls</h2><p><ApiStatus state={apiState} /> · Casa · Rodada 18 · Estádio Aurora</p></div><div className="formation-switch">{["4-3-3", "4-4-2", "3-5-2"].map((item) => <button className={formation === item ? "active" : ""} key={item} onClick={() => { setFormation(item); setSaved(false); }} type="button">{item}</button>)}</div><button className="primary-game-button" onClick={saveLineup} type="button">{saved ? "Escalação salva" : "Salvar escalação"} <span>✓</span></button></div>{notice && <div className="game-toast">✓ {notice}</div>}<div className="lineup-layout"><div className="pitch-wrap"><div className="pitch" onPointerMove={moveDragged} onPointerUp={() => setDragging(null)} onPointerCancel={() => setDragging(null)}><div className="pitch-lines" /><div className="pitch-center-circle" />{positions.map((position, index) => <button className={`pitch-player ${selectedPlayer === position.name ? "selected" : ""} ${dragging === index ? "dragging" : ""}`} style={{ left: `${position.x}%`, top: `${position.y}%` }} key={`${position.name}-${index}`} onClick={() => setSelectedPlayer(position.name)} onPointerDown={(event) => { event.preventDefault(); setDragging(index); event.currentTarget.setPointerCapture(event.pointerId); }} type="button"><span className={`pitch-player-head ${position.player.image}`} /><strong>{position.name}</strong><small>{position.pos} · {position.player.rating}</small></button>)}</div><div className="pitch-caption"><span><i className="online-dot" /> Arraste os jogadores para ajustar · <b>Salve para sincronizar com a API</b></span><span>Força do time <b>86.4</b></span></div></div><aside className="lineup-side"><div className="side-heading"><span className="eyebrow">BANCO DE RESERVAS</span><span>{lineupPlayers.length} jogadores</span></div>{lineupPlayers.map((player) => <button className="bench-player" key={player.name} onClick={() => setSelectedPlayer(player.name)} type="button"><Portrait player={player} size="small" /><span><strong>{player.name}</strong><small>{player.position} · forma {player.rating}%</small></span><b>{player.rating}</b></button>)}<div className="tactic-box"><span className="eyebrow">INSTRUÇÃO DA EQUIPE</span><strong>Pressão alta</strong><p>Seu time recupera a bola 12% mais rápido, mas gasta mais energia.</p><button onClick={() => setSelectedPlayer("tactic")} type="button">Mudar instrução →</button></div></aside></div></GameFrame>;
}

export function TransferListScreen() {
  const [filter, setFilter] = useState("Todos");
  const [notice, setNotice] = useState("");
  const [coins, setCoins] = useState(24850);
  const [ownedPlayers, setOwnedPlayers] = useState<string[]>([]);
  const { catalog, apiState } = useCatalog();
  const list = filter === "Extremos" ? catalog.players.filter((player) => player.color === "coral") : filter === "Diamante" ? catalog.players.filter((player) => player.color === "diamond") : filter === "Ouro" ? catalog.players.filter((player) => player.color === "gold") : catalog.players;
  useEffect(() => {
    fetch("/api/auth/me", { headers: { Accept: "application/json" } }).then((response) => response.ok ? response.json() as Promise<{ wallet?: { balance?: number } }> : Promise.reject(new Error("wallet unavailable"))).then((payload) => setCoins(payload.wallet?.balance ?? 0)).catch(() => setNotice("API indisponível: o mercado não pode confirmar saldo localmente."));
  }, []);

  function buyPlayer(player: GamePlayer) {
    const key = String(player.id ?? player.name);
    const cost = parseCoins(player.price) || Math.max(1800, player.rating * 110);
    if (ownedPlayers.includes(key)) {
      setNotice(`${player.name} já está no seu elenco.`);
      return;
    }
    if (coins < cost) {
      setNotice(`Saldo insuficiente para contratar ${player.name}.`);
      return;
    }
    fetch(`/api/game/v1/transfers/${player.id ?? key}/buy`, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json", "Idempotency-Key": `player-${player.id ?? key}-${crypto.randomUUID()}` }, body: JSON.stringify({ payment_method: "coins" }) }).then(async (response) => { const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.message || "Não foi possível contratar este jogador."); return payload; }).then((payload) => { const nextCoins = payload.wallet?.balance ?? coins - cost; setCoins(nextCoins); setOwnedPlayers((current) => [...current, key]); setNotice(`${player.name} contratado por ${formatCoins(cost)} FC e adicionado ao elenco.`); }).catch((error: Error) => setNotice(error.message));
  }

  return <GameFrame title="Lista de transferências" kicker="MERCADO GLOBAL · 248 OFERTAS"><div className="market-hero"><div><span className="eyebrow">JANELA ABERTA</span><h2>Encontre a peça<br /><em>que faltava.</em></h2><p><ApiStatus state={apiState} /> · O mercado atualiza a cada 15 minutos com jogadores base, Diamante e Extremos disponíveis para sua carreira.</p><button className="primary-game-button" onClick={() => setFilter("Extremos")} type="button">Ver Extremos <span>✦</span></button></div><div className="market-hero-orbit"><span>92</span><small>ATA</small><b>L. ANDRADE</b><em>EXTREMO</em></div></div><div className="market-toolbar"><div className="market-filters">{["Todos", "Extremos", "Diamante", "Ouro"].map((item) => <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)} type="button">{item}</button>)}</div><div className="market-search">⌕ <input placeholder="Buscar jogador ou clube" /></div><span className="market-wallet">◈ {formatCoins(coins)} FC</span></div><div className="transfer-table"><div className="transfer-head"><span>JOGADOR</span><span>FORÇA</span><span>FORMA</span><span>VALOR</span><span /></div>{list.map((player, index) => { const key = String(player.id ?? player.name); const cost = parseCoins(player.price) || Math.max(1800, player.rating * 110); const owned = ownedPlayers.includes(key); return <div className="transfer-row" key={key}><div className="transfer-player"><Portrait player={player} size="small" /><span><strong>{player.name}</strong><small>{player.position} · FC Aurora</small></span></div><strong className="transfer-rating">{player.rating}</strong><span className="form-pips"><i /><i /><i /><i className={index === 2 ? "draw" : ""} /></span><span className="transfer-price">{formatCoins(cost)} <small>FC</small></span><button className={`buy-button ${owned ? "owned" : ""}`} onClick={() => buyPlayer(player)} type="button">{owned ? "No elenco" : "Comprar"} <span>{owned ? "✓" : "→"}</span></button></div>; })}</div>{notice && <div className="game-toast">✓ {notice}</div>}</GameFrame>;
}

export function StandingsScreen() {
  const { catalog, apiState } = useCatalog();
  return <GameFrame title="Classificação" kicker="LIGA BRASILEIRA · TEMPORADA 07"><div className="standings-highlight"><div><span className="eyebrow">A DISPUTA ESTÁ PEGANDO FOGO</span><h2>Cada ponto conta<br /><em>até o último minuto.</em></h2><p><ApiStatus state={apiState} /> · O FC Aurora subiu duas posições nas últimas três rodadas. A liderança está a 6 pontos.</p></div><div className="standings-mini-chart"><span>EVOLUÇÃO NA LIGA</span><div><i style={{ height: "43%" }} /><i style={{ height: "55%" }} /><i style={{ height: "49%" }} /><i style={{ height: "72%" }} /><i style={{ height: "66%" }} /><i style={{ height: "89%" }} /></div></div></div><div className="standings-layout"><article className="standings-card"><div className="standings-tabs"><button className="active" type="button">Classificação</button><button type="button">Artilheiros</button><button type="button">Calendário</button></div><div className="standings-head"><span>#</span><span>CLUBE</span><span>J</span><span>V</span><span>PTS</span><span>FORMA</span></div>{catalog.standings.map((row) => <div className={`standing-row ${row.rank === 3 ? "you" : ""}`} key={row.team}><strong>{row.rank}</strong><span className="standing-team">{row.flagUrl ? <img className="standing-flag" src={row.flagUrl} alt={`Bandeira de ${row.country ?? ""}`} /> : <i className={`small-crest crest-${row.rank}`} />}{row.team}{row.rank === 3 && <em>VOCÊ</em>}</span><span>{row.played}</span><span>{row.win}</span><b>{row.points}</b><span className="form-pips">{row.form.map((form, index) => <i className={form} key={`${form}-${index}`} />)}</span></div>)}</article><aside className="next-match-card"><span className="eyebrow">PRÓXIMO JOGO</span><div className="next-match-time">DOM · 20:30</div><div className="next-team"><span className="big-crest">FC</span><strong>FC Aurora</strong><small>Casa</small></div><div className="vs-line"><span /> VS <span /></div><div className="next-team"><span className="big-crest coral-crest">RB</span><strong>Rio Bulls</strong><small>Fora</small></div><Link className="primary-game-button wide" href="/lineup">Preparar partida <span>→</span></Link></aside></div></GameFrame>;
}

export function StadiumScreen() {
  const [active, setActive] = useState("Estádio");
  const { catalog, apiState } = useCatalog();
  const stadium = catalog.stadiums[0] ?? catalogFallback.stadiums[0];
  const upgrades = stadium.upgrades;
  return <GameFrame title={stadium.name} kicker="CLUBE · INFRAESTRUTURA"><div className="stadium-hero"><div className="stadium-image" /><div className="stadium-hero-copy"><span className="eyebrow">SEU LAR · CAPACIDADE {stadium.capacity}</span><h2>Faça o Aurora<br /><em>vibrar.</em></h2><p><ApiStatus state={apiState} /> · Melhore sua casa para ganhar mais receita, formar jogadores melhores e criar uma atmosfera que pesa na partida.</p><div className="stadium-revenue"><span><strong>+18%</strong><small>receita por jogo</small></span><span><strong>+12%</strong><small>força em casa</small></span></div></div></div><div className="stadium-tabs">{["Estádio", "Treinamento", "Clube", "Finanças"].map((tab) => <button className={active === tab ? "active" : ""} key={tab} onClick={() => setActive(tab)} type="button">{tab}</button>)}</div><div className="upgrade-layout"><article className="upgrade-panel"><div className="game-section-heading"><div><span className="eyebrow">PRÓXIMOS UPGRADES</span><h2>{active} · evolução</h2></div><span className="game-muted">Saldo disponível · <b>24.850 FC</b></span></div>{upgrades.map((upgrade) => <div className="upgrade-row" key={upgrade.name}><span className={`upgrade-icon ${upgrade.tone}`}>{upgrade.icon}</span><div className="upgrade-info"><strong>{upgrade.name}</strong><small>{upgrade.level} · próxima melhoria em {upgrade.value} FC</small><div className="upgrade-track"><span style={{ width: `${upgrade.progress}%` }} /></div></div><b className="upgrade-progress">{upgrade.progress}%</b><button onClick={() => setActive(upgrade.name)} type="button">Melhorar <span>→</span></button></div>)}</article><aside className="stadium-side"><div className="stadium-level"><span className="eyebrow">NÍVEL DO CLUBE</span><strong>{stadium.level}</strong><small>Próximo nível: 1.250 XP</small><div className="progress-track"><span style={{ width: "74%" }} /></div></div><div className="stadium-activity"><span className="eyebrow">ATIVIDADE RECENTE</span><p><b>+ 2.400 FC</b> bilheteria recebida após vitória contra United FC.</p><p><b>Upgrade concluído</b> · iluminação de campo nível 03.</p></div></aside></div></GameFrame>;
}

type MatchMode = "equilibrado" | "atacar" | "defender";
type MatchState = {
  minute: number;
  homeScore: number;
  awayScore: number;
  homePower: number;
  awayPower: number;
  mode: MatchMode;
  possession: number;
  narration: string;
  events: string[];
};

const initialMatch: MatchState = {
  minute: 37,
  homeScore: 1,
  awayScore: 0,
  homePower: 78,
  awayPower: 64,
  mode: "equilibrado",
  possession: 57,
  narration: "Andrade recebe entre as linhas e o Aurora prepara mais uma jogada pelo corredor esquerdo.",
  events: ["37' · Aurora mantém a posse no campo de ataque", "31' · Defesa do Rio Bulls afasta o cruzamento", "24' · Gol do FC Aurora · L. Andrade"],
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function LiveMatchScreen() {
  const [match, setMatch] = useState<MatchState>(initialMatch);
  const [source, setSource] = useState<"websocket" | "simulacao">("simulacao");
  const [selectedPlayer, setSelectedPlayer] = useState("L. Andrade");
  const [powerUsed, setPowerUsed] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (wsUrl && typeof WebSocket !== "undefined") {
      const socket = new WebSocket(`${wsUrl.replace(/\/$/, "")}/matches/aurora-07`);
      wsRef.current = socket;
      socket.onopen = () => setSource("websocket");
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as Partial<MatchState>;
          setMatch((current) => ({ ...current, ...payload, events: payload.events ?? current.events }));
        } catch {
          // Ignore malformed broadcasts; the local heartbeat keeps the match alive.
        }
      };
      socket.onclose = () => setSource("simulacao");
      socket.onerror = () => setSource("simulacao");
    }

    const heartbeat = window.setInterval(() => {
      setMatch((current) => {
        const swing = current.mode === "atacar" ? 2 : current.mode === "defender" ? -1 : 0;
        const homePower = clamp(current.homePower + swing + (Math.random() > .57 ? 1 : -1), 22, 96);
        const awayPower = clamp(current.awayPower + (Math.random() > .61 ? 1 : -1), 24, 93);
        const possession = clamp(Math.round((homePower / (homePower + awayPower)) * 100), 25, 75);
        const minute = Math.min(90, current.minute + 1);
        const stronger = homePower >= awayPower;
        const narration = stronger
          ? `O Aurora cresce no jogo. ${selectedPlayer} acelera a troca de passes e o adversário recua.`
          : "O Rio Bulls ganhou a segunda bola e começa a empurrar o Aurora para trás.";
        return { ...current, minute, homePower, awayPower, possession, narration };
      });
    }, 3200);

    return () => {
      window.clearInterval(heartbeat);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [selectedPlayer]);

  async function sendAction(action: string) {
    const body = JSON.stringify({ action, player: selectedPlayer });
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify({ type: "match.action", matchId: "aurora-07", action, player: selectedPlayer }));
    const response = await fetch("/api/game/v1/matches/aurora-07/actions", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json", "Idempotency-Key": `match-aurora-07-${crypto.randomUUID()}` }, body }).catch(() => null);
    if (response && !response.ok) {
      const payload = await response.json().catch(() => ({}));
      setMatch((current) => ({ ...current, narration: payload.message || "A ação não foi aceita pela API." }));
    }
  }

  function tacticalAction(mode: MatchMode) {
    sendAction(mode);
    setMatch((current) => ({
      ...current,
      mode,
      homePower: clamp(current.homePower + (mode === "atacar" ? 8 : mode === "defender" ? 4 : 2), 0, 100),
      narration: mode === "atacar" ? "O manager manda o time subir as linhas. O Aurora vai para cima!" : mode === "defender" ? "Bloco baixo acionado. O Aurora fecha os espaços e protege a vantagem." : "O time volta ao equilíbrio e prepara o próximo momento da partida.",
      events: [`${current.minute}' · Instrução alterada para ${mode}`, ...current.events].slice(0, 4),
    }));
  }

  function substitute() {
    const nextPlayer = selectedPlayer === "M. Costa" ? "N. Melo" : "M. Costa";
    sendAction("substitute");
    setSelectedPlayer(nextPlayer);
    setMatch((current) => ({ ...current, homePower: clamp(current.homePower + 3, 0, 100), narration: `${nextPlayer} entra com energia nova. A comissão técnica busca mudar o ritmo da partida.`, events: [`${current.minute}' · Substituição: ${nextPlayer} entra`, ...current.events].slice(0, 4) }));
  }

  function useItemPower() {
    if (powerUsed) return;
    sendAction("item-power");
    setPowerUsed(true);
    setMatch((current) => ({ ...current, homePower: clamp(current.homePower + 12, 0, 100), possession: clamp(current.possession + 7, 25, 75), narration: "Poder Fogo ativado! A Chuteira Fênix deixa Andrade mais rápido no último terço.", events: [`${current.minute}' · Chuteira Fênix ativada · +12 força`, ...current.events].slice(0, 4) }));
  }

  const totalPower = match.homePower + match.awayPower;
  const homePercent = Math.round((match.homePower / totalPower) * 100);
  const homeIsStronger = match.homePower >= match.awayPower;
  const activePlayers = ["L. Andrade", "M. Costa", "N. Melo"];

  return <GameFrame title="Partida ao vivo" kicker="RODADA 18 · TRANSMISSÃO EM TEMPO REAL"><div className="live-match-head"><div><span className="eyebrow">FC AURORA · ESTÁDIO AURORA</span><h2>O jogo acontece agora.</h2><p>Decida rápido. Cada instrução altera o ritmo, a força e as chances da próxima jogada.</p></div><span className={`match-connection ${source}`}><i /> {source === "websocket" ? "WebSocket conectado" : "Simulação local · pronta para conectar"}</span></div><div className="live-scoreboard"><div className="live-team"><span className="live-crest aurora">FC</span><strong>FC Aurora</strong><small>Casa</small></div><div className="live-score"><span>AO VIVO · {match.minute}&apos;</span><strong>{match.homeScore} <em>—</em> {match.awayScore}</strong><small>Rodada 18 · Temporada 07</small></div><div className="live-team"><span className="live-crest bulls">RB</span><strong>Rio Bulls</strong><small>Fora</small></div></div><section className={`live-power-card ${homeIsStronger ? "home-advantage" : "away-advantage"}`}><div className="power-heading"><div><span className="eyebrow">TERMÔMETRO DA PARTIDA</span><h3>{homeIsStronger ? "Aurora está por cima" : "Rio Bulls está por cima"}</h3></div><strong>{homePercent}% <small>força Aurora</small></strong></div><div className="power-bar"><span style={{ width: `${homePercent}%` }} /></div><div className="power-legend"><span><i className="home-dot" /> Aurora · {match.homePower} força</span><span>{match.possession}% posse <i className="away-dot" /> Rio Bulls · {match.awayPower} força</span></div><div className="narrator"><span className="narrator-icon">◖</span><div><span className="eyebrow">NARRADOR</span><p>{match.narration}</p></div></div></section><div className="live-match-grid"><article className="live-pitch-card"><div className="live-section-top"><div><span className="eyebrow">CONTROLE DA EQUIPE</span><h3>Escolha seu próximo movimento</h3></div><span className="live-mode">Modo: <b>{match.mode}</b></span></div><div className="live-pitch"><div className="live-pitch-lines" /><div className="live-ball">●</div><div className="live-player-token token-a">LA<small>92</small></div><div className="live-player-token token-b">MC<small>88</small></div><div className="live-player-token token-c">NM<small>86</small></div><div className="live-player-token token-d opponent">RB<small>79</small></div></div><div className="tactical-actions"><button className={match.mode === "defender" ? "active defend" : ""} onClick={() => tacticalAction("defender")} type="button"><span>◈</span><strong>Defender</strong><small>Fechar espaços</small></button><button className={match.mode === "equilibrado" ? "active balanced" : ""} onClick={() => tacticalAction("equilibrado")} type="button"><span>◒</span><strong>Equilibrado</strong><small>Controlar o ritmo</small></button><button className={match.mode === "atacar" ? "active attack" : ""} onClick={() => tacticalAction("atacar")} type="button"><span>↗</span><strong>Atacar</strong><small>Subir as linhas</small></button></div></article><aside className="live-control-side"><div className="live-side-box"><span className="eyebrow">JOGADOR EM FOCO</span><div className="live-player-select">{activePlayers.map((player) => <button className={selectedPlayer === player ? "selected" : ""} key={player} onClick={() => setSelectedPlayer(player)} type="button"><span className={`mini-player-avatar ${player === "L. Andrade" ? "portrait-a" : player === "M. Costa" ? "portrait-b" : "portrait-c"}`} />{player}<b>{player === "L. Andrade" ? "92" : player === "M. Costa" ? "88" : "86"}</b></button>)}</div><button className="substitute-button" onClick={substitute} type="button">⇄ Fazer substituição <span>→</span></button></div><div className="live-side-box item-power-box"><span className="eyebrow">PODER DO ITEM</span><div className="item-power-preview"><span className="mini-item-art" /><div><strong>Chuteira Fênix</strong><small>Fogo · +8 finalização</small></div><b>+12</b></div><button className="item-power-button" disabled={powerUsed} onClick={useItemPower} type="button">{powerUsed ? "Poder utilizado nesta partida" : "Usar poder agora · 1 carga"}</button></div></aside></div><section className="live-events"><div className="live-section-top"><div><span className="eyebrow">LINHA DO TEMPO</span><h3>O narrador não perde nada</h3></div><span className="live-ticker"><i /> atualização a cada 3,2s</span></div><div className="event-list">{match.events.map((event, index) => <span className={index === 0 ? "latest" : ""} key={`${event}-${index}`}><i />{event}</span>)}</div></section></GameFrame>;
}
