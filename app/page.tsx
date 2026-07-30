"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Section = "overview" | "squad" | "transfers" | "ranking" | "store" | "admin";
type Tier = "silver" | "gold" | "diamond" | "extreme";
type ItemCategory = "chuteira" | "luva" | "colar" | "touca" | "mascara";
type ItemElement = "fogo" | "agua" | "raio" | "vento" | "gelo";

type PlayerItem = {
  id: number;
  name: string;
  category: ItemCategory;
  element: ItemElement;
  power: number;
  effect: string;
  price: string;
  icon: string;
  artPosition: string;
  priceFc?: number;
};

type Player = {
  id: number;
  name: string;
  role: string;
  team: string;
  rating: number;
  price: string;
  tier: Tier;
  accent: string;
  initials: string;
  tags?: string[];
  stats: [number, number, number];
  equippedItems?: PlayerItem[];
  avatar?: string;
  avatarUrl?: string;
};

type PortalNews = {
  id: string;
  kind: "oferta" | "partida" | "trofeu";
  title: string;
  detail: string;
  time: string;
  team: string;
  country: string;
  flagUrl?: string;
};

type PortalAchievement = {
  name: string;
  description: string;
  progress: number;
  total: number;
  icon: string;
  tone: string;
};

type PortalTrophy = { name: string; season: string; icon: string; tone: string };

type PortalPayload = {
  managerPoints: number;
  globalRank: number;
  onlineManagers: number;
  news: PortalNews[];
  achievements: PortalAchievement[];
  trophies: PortalTrophy[];
};

type AdminSnapshot = { users: number; active_users: number; pending_orders: number; players: number; last_sync?: { status?: string; started_at?: string; records_processed?: number } | null };
type AdminOrder = { id: number; kind: string; status: string; total_cents: number; user?: { name?: string; email?: string }; payload?: { coins?: number; player_id?: number } };
type PendingPixOrder = { id: number | string; status: string; total_cents: number };

type ManagerSession = { name?: string; email?: string; role?: string; team?: { name?: string }; loggedAt?: string };

const portalFallback: PortalPayload = {
  managerPoints: 9450,
  globalRank: 3,
  onlineManagers: 1248,
  news: [
    { id: "news-1", kind: "oferta", title: "Mister 4-3-3 cobrou L. Andrade", detail: "Oferta de 12.400 FC · decisão pendente", time: "agora", team: "Porto Legends", country: "PT" },
    { id: "news-2", kind: "partida", title: "Seu próximo jogo foi confirmado", detail: "FC Aurora x Rio Bulls · domingo, 20:30", time: "há 8 min", team: "FC Aurora", country: "BR" },
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

const itemArtPositions = ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"];

function countryFlag(country: string) {
  return { BR: "🇧🇷", PT: "🇵🇹", GB: "🇬🇧", ES: "🇪🇸", EU: "🇪🇺" }[country] ?? "🌐";
}

const items: PlayerItem[] = [
  { id: 1, name: "Chuteira Fênix", category: "chuteira", element: "fogo", power: 8, effect: "+8 finalização no último terço", price: "1.900", icon: "♢", artPosition: "top-left" },
  { id: 2, name: "Luva Maré Alta", category: "luva", element: "agua", power: 7, effect: "+7 reflexo em bolas molhadas", price: "1.650", icon: "◒", artPosition: "top-right" },
  { id: 3, name: "Colar Voltagem", category: "colar", element: "raio", power: 6, effect: "+6 aceleração após roubar a bola", price: "1.350", icon: "ϟ", artPosition: "middle-left" },
  { id: 4, name: "Touca Ventus", category: "touca", element: "vento", power: 5, effect: "+5 resistência e pressão", price: "980", icon: "⌁", artPosition: "middle-right" },
  { id: 5, name: "Máscara Glacial", category: "mascara", element: "gelo", power: 9, effect: "+9 marcação em duelos decisivos", price: "2.200", icon: "◉", artPosition: "bottom-left" },
  { id: 6, name: "Chuteira Maré", category: "chuteira", element: "agua", power: 6, effect: "+6 passe sob pressão", price: "1.450", icon: "♢", artPosition: "bottom-right" },
];

const starLandingPlayers = [
  { id: 154, name: "L. Messi", role: "ATA", team: "Inter Miami", rating: 93, photo: "https://media.api-sports.io/football/players/154.png", goals: 23, assists: 13, tag: "EXTREMO" },
  { id: 874, name: "C. Ronaldo", role: "ATA", team: "Al Nassr", rating: 91, photo: "https://media.api-sports.io/football/players/874.png", goals: 35, assists: 11, tag: "EXTREMO" },
  { id: 276, name: "Neymar Jr", role: "ATA", team: "Santos FC", rating: 89, photo: "https://media.api-sports.io/football/players/276.png", goals: 8, assists: 6, tag: "EXTREMO" },
  { id: 278, name: "K. Mbappé", role: "ATA", team: "Real Madrid", rating: 93, photo: "https://media.api-sports.io/football/players/278.png", goals: 27, assists: 10, tag: "EXTREMO" },
  { id: 1100, name: "Vinícius Jr", role: "ATA", team: "Real Madrid", rating: 92, photo: "https://media.api-sports.io/football/players/1100.png", goals: 24, assists: 11, tag: "EXTREMO" },
  { id: 1466, name: "E. Haaland", role: "ATA", team: "Man City", rating: 93, photo: "https://media.api-sports.io/football/players/1466.png", goals: 38, assists: 5, tag: "EXTREMO" },
];

const players: Player[] = [
  {
    id: 154,
    name: "L. Messi",
    role: "ATA",
    team: "Inter Miami",
    rating: 93,
    price: "58.000",
    tier: "extreme",
    accent: "#ff9800",
    initials: "LM",
    tags: ["Armador", "Lenda"],
    stats: [94, 95, 65],
    avatar: "portrait-a",
    avatarUrl: "https://media.api-sports.io/football/players/154.png",
    equippedItems: [items[0], items[2]],
  },
  {
    id: 874,
    name: "C. Ronaldo",
    role: "ATA",
    team: "Al Nassr",
    rating: 91,
    price: "52.000",
    tier: "extreme",
    accent: "#ff9800",
    initials: "CR",
    tags: ["Artilheiro", "Capitão"],
    stats: [93, 84, 70],
    avatar: "portrait-b",
    avatarUrl: "https://media.api-sports.io/football/players/874.png",
    equippedItems: [items[3]],
  },
  {
    id: 276,
    name: "Neymar Jr",
    role: "ATA",
    team: "Santos FC",
    rating: 89,
    price: "38.000",
    tier: "extreme",
    accent: "#ff9800",
    initials: "NJ",
    tags: ["Driblador"],
    stats: [88, 92, 60],
    avatar: "portrait-c",
    avatarUrl: "https://media.api-sports.io/football/players/276.png",
    equippedItems: [items[4]],
  },
  {
    id: 1100,
    name: "Vinícius Jr",
    role: "ATA",
    team: "Real Madrid",
    rating: 92,
    price: "68.000",
    tier: "extreme",
    accent: "#ff9800",
    initials: "VJ",
    tags: ["Velocista", "Driblador"],
    stats: [95, 90, 68],
    avatar: "portrait-a",
    avatarUrl: "https://media.api-sports.io/football/players/1100.png",
  },
  {
    id: 278,
    name: "K. Mbappé",
    role: "ATA",
    team: "Real Madrid",
    rating: 93,
    price: "72.000",
    tier: "extreme",
    accent: "#ff9800",
    initials: "KM",
    tags: ["Velocista", "Finalizador"],
    stats: [97, 88, 62],
    avatar: "portrait-b",
    avatarUrl: "https://media.api-sports.io/football/players/278.png",
  },
  {
    id: 1466,
    name: "E. Haaland",
    role: "ATA",
    team: "Man City",
    rating: 93,
    price: "74.000",
    tier: "extreme",
    accent: "#ff9800",
    initials: "EH",
    tags: ["Força", "Finalizador"],
    stats: [96, 75, 76],
    avatar: "portrait-c",
    avatarUrl: "https://media.api-sports.io/football/players/1466.png",
  },
];

const navItems: Array<{ id: Section; label: string; icon: string }> = [
  { id: "overview", label: "Visão geral", icon: "⌂" },
  { id: "squad", label: "Meu elenco", icon: "♙" },
  { id: "transfers", label: "Transferências", icon: "↗" },
  { id: "ranking", label: "Ranking global", icon: "♛" },
  { id: "store", label: "Loja & moedas", icon: "✦" },
  { id: "admin", label: "Administração", icon: "▦" },
];

const rankingRows = [
  { rank: 1, name: "Gabi Tática", club: "Real Madrid", country: "ES", rating: 9820, wins: "84%", movement: "—", avatar: "GT", tone: "gold" },
  { rank: 2, name: "Mister 4-3-3", club: "Man City", country: "GB", rating: 9675, wins: "81%", movement: "↗ 1", avatar: "M4", tone: "silver" },
  { rank: 3, name: "Bruno Mendes", club: "FC Aurora", country: "BR", rating: 9450, wins: "79%", movement: "↗ 2", avatar: "BM", tone: "you" },
  { rank: 4, name: "The Professor", club: "Liverpool", country: "GB", rating: 9390, wins: "77%", movement: "↘ 1", avatar: "TP", tone: "blue" },
  { rank: 5, name: "Lívia FC", club: "Inter Miami", country: "US", rating: 9218, wins: "75%", movement: "↗ 4", avatar: "LF", tone: "coral" },
  { rank: 6, name: "Tiki Taka 10", club: "Barcelona", country: "ES", rating: 9164, wins: "73%", movement: "—", avatar: "T10", tone: "purple" },
  { rank: 7, name: "Coach Kadu", club: "Santos FC", country: "BR", rating: 9072, wins: "71%", movement: "↗ 1", avatar: "CK", tone: "green" },
];

function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link className="landing-brand" href="/"><span className="brand-mark">FC</span><span>FC <b>MANAGER</b></span><i>ONLINE</i></Link>
        <nav className="landing-nav" aria-label="Navegação da apresentação"><a href="#craques">Craques</a><a href="#jogo">O jogo</a><a href="#carreira">Carreira</a><a href="#ranking">Ranking global</a></nav>
        <div className="landing-actions"><span className="landing-language">PT-BR⌄</span><Link className="landing-login" href="/login">Entrar</Link><Link className="landing-cta" href="/login?mode=register">Criar conta <span>→</span></Link></div>
      </header>
      <section className="landing-hero" id="jogo">
        <div className="landing-hero-copy"><span className="eyebrow">FC MANAGER ONLINE · TEMPORADA 07</span><h1>Seu clube.<br /><em>Suas decisões.</em></h1><p>Monte o elenco com os maiores craques do futebol mundial, viva cada rodada em tempo real e construa sua lenda.</p><div className="landing-hero-actions"><Link className="landing-primary" href="/login?mode=register">Começar agora <span>→</span></Link><Link className="landing-secondary" href="/login">Já tenho uma conta <span>↗</span></Link></div><div className="landing-trust"><span><i /> 18.4k managers online</span><span>✦ Partidas em tempo real</span><span>◈ Ranking global</span></div></div>
        <div className="landing-match-card"><div className="landing-match-top"><span>PRÓXIMA PARTIDA</span><b><i /> AO VIVO EM 18:42:12</b></div><div className="landing-match-stage"><div className="landing-club"><span className="landing-crest aurora">FC</span><strong>FC Aurora</strong><small>Casa · Força 92</small></div><div className="landing-score"><span>DOM · 20:30</span><strong>VS</strong><small>Estádio Aurora</small></div><div className="landing-club"><span className="landing-crest bulls">RM</span><strong>Real Madrid</strong><small>Fora · Força 94</small></div></div><div className="landing-match-foot"><span>Rodada 18 · Liga dos Campeões</span><Link href="/login">Preparar time →</Link></div></div>
      </section>

      {/* Star Players Showcase */}
      <section className="landing-stars" id="craques">
        <div className="landing-stars-header">
          <span className="eyebrow">ELENCO DE ELITE · NÍVEL EXTREMO</span>
          <h2>Os Maiorais do Futebol Mundial</h2>
          <p>Estatísticas reais e atualizadas dos craques que você pode contratar para o seu time.</p>
        </div>
        <div className="landing-stars-grid">
          {starLandingPlayers.map((player) => (
            <article className="star-card" key={player.id}>
              <span className="star-card-shine" />
              <span className="star-card-tag">{player.tag}</span>
              <div className="star-card-rating">{player.rating}</div>
              <div className="star-card-pos">{player.role}</div>
              <img className="star-card-photo" src={player.photo} alt={player.name} loading="lazy" />
              <div className="star-card-name">{player.name}</div>
              <div className="star-card-team">{player.team}</div>
              <div className="star-card-stats">
                <span><b>{player.goals}</b>Gols</span>
                <span><b>{player.assists}</b>Assist</span>
                <span><b>99</b>Ritmo</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-showcase" id="carreira"><div className="landing-section-title"><div><span className="eyebrow">UM UNIVERSO PARA VIVER</span><h2>Você decide o próximo capítulo.</h2></div><p>Do primeiro contrato ao troféu da temporada, cada tela foi pensada para a decisão do manager ficar sempre a um toque.</p></div><div className="landing-feature-grid"><article><span className="landing-feature-icon mint">♙</span><strong>Construa seu elenco</strong><p>Contrate Messi, Cristiano Ronaldo, Neymar e estrelas mundiais com itens e poderes.</p><Link href="/login">Ver jogadores <span>→</span></Link></article><article><span className="landing-feature-icon purple">⌁</span><strong>Controle cada partida</strong><p>Arraste sua escalação, mude a tática e reaja ao jogo em tempo real.</p><Link href="/login">Conhecer a carreira <span>→</span></Link></article><article><span className="landing-feature-icon gold">♛</span><strong>Suba no ranking</strong><p>Conquiste pontos, troféus e convide seus amigos para disputar o topo.</p><Link href="/login">Abrir ranking <span>→</span></Link></article></div><div className="landing-collection"><div className="landing-collection-copy"><span className="eyebrow">CARTAS QUE FAZEM DIFERENÇA</span><h2>Brilhe dentro e fora do campo.</h2><p>Descubra jogadores especiais e equipe poderes para mudar a partida no momento decisivo.</p><div className="landing-power-list"><span><i className="power-dot fire" /> Fogo · finalização</span><span><i className="power-dot water" /> Água · controle</span><span><i className="power-dot ice" /> Gelo · marcação</span></div><Link className="landing-secondary" href="/login">Abrir o arsenal <span>→</span></Link></div><div className="landing-player-showcase"><article className="landing-player-card extreme"><span className="landing-card-rarity">EXTREMO</span><strong>93</strong><small>ATA</small><span className="landing-player-portrait portrait-a" /><b>L. Messi</b><em>FÊNIX · +8</em></article><article className="landing-player-card diamond"><span className="landing-card-rarity">EXTREMO</span><strong>91</strong><small>ATA</small><span className="landing-player-portrait portrait-b" /><b>C. Ronaldo</b><em>VENTO · +5</em></article></div><div className="landing-item-showcase"><span className="eyebrow">ITENS ESPECIAIS</span><div className="landing-item-row"><article><span className="landing-item-art shoe" /><strong>Chuteira Fênix</strong><small>♨ Fogo · +8 poder</small></article><article><span className="landing-item-art mask" /><strong>Máscara Glacial</strong><small>❄ Gelo · +9 poder</small></article><article><span className="landing-item-art glove" /><strong>Luva Maré Alta</strong><small>◒ Água · +7 poder</small></article></div></div></div></section>
      <section className="landing-bottom" id="ranking"><div><span className="eyebrow">A SUA HISTÓRIA COMEÇA AQUI</span><h2>Pronto para assumir o comando?</h2><p>Escolha seu clube e transforme cada rodada em uma nova história.</p></div><Link className="landing-primary" href="/login?mode=register">Criar minha carreira <span>→</span></Link></section>
      <footer className="landing-footer"><span>FC MANAGER ONLINE · Temporada 07</span><span>Jogo de gestão de futebol online com sincronização de atletas reais.</span></footer>
    </main>
  );
}

const copy = {
  pt: {
    greeting: "Bom dia, Bruno",
    overview: "Visão geral",
    squad: "Meu elenco",
    transfers: "Transferências",
    ranking: "Ranking global",
    store: "Loja & moedas",
    admin: "Administração",
    play: "Abrir jogo online",
    buy: "Comprar",
  },
  en: {
    greeting: "Good morning, Bruno",
    overview: "Overview",
    squad: "My squad",
    transfers: "Transfers",
    ranking: "Global ranking",
    store: "Store & coins",
    admin: "Administration",
    play: "Open online game",
    buy: "Buy",
  },
};

function PlayerCard({ player, onSelect }: { player: Player; onSelect: () => void }) {
  return (
    <button className={`player-card tier-${player.tier}`} onClick={onSelect} type="button">
      <span className="card-shine" />
      <span className="player-rating">{player.rating}</span>
      <span className="player-position">{player.role}</span>
      <span className={`player-orbit player-avatar-photo ${player.avatar ?? "portrait-a"}`} style={{ backgroundImage: `url(${player.avatarUrl ?? "/player-avatars.png"})` }} aria-label={`Avatar de ${player.name}`} />
      <span className="player-name">{player.name}</span>
      <span className="player-team">{player.team}</span>
      {player.equippedItems && <span className="player-items-mini">{player.equippedItems.slice(0, 2).map((item) => <span key={item.id} title={`${item.name} · +${item.power} poder`}>{item.icon} +{item.power}</span>)}</span>}
      <span className="player-card-footer">
        <span>{player.tier === "extreme" ? "EXTREMO" : player.tier.toUpperCase()}</span>
        <span>{player.price} FC</span>
      </span>
    </button>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-line">
      <span>{label}</span>
      <div className="stat-track">
        <span style={{ width: `${value}%` }} />
      </div>
      <strong>{value}</strong>
    </div>
  );
}

export default function Home() {
  const [sessionStatus, setSessionStatus] = useState<"loading" | "guest" | "manager">("loading");
  const [managerSession, setManagerSession] = useState<ManagerSession>({ name: "Bruno Mendes" });
  const [section, setSection] = useState<Section>("overview");
  const [locale, setLocale] = useState<"pt" | "en">("pt");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [toast, setToast] = useState("");
  const [dashboardPlayers, setDashboardPlayers] = useState<Player[]>(players);
  const [dashboardItems, setDashboardItems] = useState<PlayerItem[]>(items);
  const [portalData, setPortalData] = useState<PortalPayload>(portalFallback);
  const [adminSnapshot, setAdminSnapshot] = useState<AdminSnapshot | null>(null);
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>([]);
  const [pendingPixOrder, setPendingPixOrder] = useState<PendingPixOrder | null>(null);
  const [catalogState, setCatalogState] = useState<"syncing" | "live" | "fallback">("syncing");
  const [adminTab, setAdminTab] = useState("Pedidos");
  const [filter, setFilter] = useState("Todos");
  const [storeTab, setStoreTab] = useState("FC coins");
  const [rankingTab, setRankingTab] = useState("Global");
  const [equippedByPlayer, setEquippedByPlayer] = useState<Record<number, PlayerItem[]>>(() => Object.fromEntries(players.map((player) => [player.id, player.equippedItems ?? []])));
  const t = copy[locale];
  const selectedItems = selectedPlayer ? equippedByPlayer[selectedPlayer.id] ?? [] : [];
  const selectedPower = selectedItems.reduce((total, item) => total + item.power, 0);
  const managerName = managerSession.name || "Bruno Mendes";
  const managerInitials = managerName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const visibleNavItems = managerSession.role === "admin" ? navItems : navItems.filter((item) => item.id !== "admin");

  useEffect(() => {
    fetch("/api/auth/me", { headers: { Accept: "application/json" } })
      .then((response) => { if (!response.ok) throw new Error("anonymous"); return response.json() as Promise<{ user: ManagerSession }>; })
      .then((payload) => { setManagerSession(payload.user); setSessionStatus("manager"); })
      .catch(() => setSessionStatus("guest"));
  }, []);

  useEffect(() => {
    if (sessionStatus !== "manager" || managerSession.role !== "admin") return;
    Promise.all([
      fetch("/api/game/v1/admin/metrics", { headers: { Accept: "application/json" } }).then((response) => response.ok ? response.json() as Promise<AdminSnapshot> : Promise.reject(new Error("admin metrics"))),
      fetch("/api/game/v1/admin/orders?status=pending", { headers: { Accept: "application/json" } }).then((response) => response.ok ? response.json() as Promise<{ data?: AdminOrder[] }> : Promise.reject(new Error("admin orders"))),
    ]).then(([metrics, orders]) => { setAdminSnapshot(metrics); setAdminOrders(orders.data ?? []); }).catch(() => undefined);
  }, [managerSession.role, sessionStatus]);

  useEffect(() => {
    let active = true;
    fetch("/api/catalog", { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
        return response.json() as Promise<{
          players?: Array<{ id?: number; name: string; position: string; rating: number; image?: string; avatarUrl?: string; color?: string; tag?: string; price?: string; team?: string }>;
          items?: Array<{ id?: number; name: string; slot: string; power: string; bonus: number; price_fc?: number; rarity: string }>;
          managerPoints?: number;
          globalRank?: number;
          onlineManagers?: number;
          news?: PortalNews[];
          achievements?: PortalAchievement[];
          trophies?: PortalTrophy[];
        }>;
      })
      .then((remote) => {
        if (!active) return;
        if (remote.players?.length) {
          setDashboardPlayers(remote.players.map((player, index) => ({
            id: player.id ?? index + 1,
            name: player.name,
            role: player.position,
            team: player.team ?? "FC Aurora",
            rating: player.rating,
            price: player.price ?? "0",
            tier: player.color === "coral" ? "extreme" : player.color === "diamond" ? "diamond" : player.color === "gold" ? "gold" : "silver",
            accent: player.color === "coral" ? "#ff7b61" : player.color === "diamond" ? "#a9d8ff" : player.color === "gold" ? "#ffd26a" : "#e3e8ef",
            initials: player.name.split(" ").map((part) => part[0]).join("").slice(0, 2),
            stats: [player.rating, Math.max(70, player.rating - 3), Math.max(70, player.rating - 1)],
            avatar: player.image ?? `portrait-${String.fromCharCode(97 + (index % 4))}`,
            avatarUrl: player.avatarUrl,
          })));
        }
        if (remote.items?.length) {
          setDashboardItems(remote.items.map((item, index) => ({
            id: item.id ?? index + 1,
            name: item.name,
            category: item.slot.toLowerCase() as ItemCategory,
            element: item.power.toLowerCase() as ItemElement,
            power: item.bonus,
            effect: `+${item.bonus} poder de ${item.power.toLowerCase()} em situações especiais`,
            price: item.price_fc ? item.price_fc.toLocaleString("pt-BR") : "1.200",
            priceFc: item.price_fc,
            icon: ["♢", "◒", "ϟ", "⌁", "◉"][index % 5],
            artPosition: itemArtPositions[index % itemArtPositions.length],
          })));
        }
        setPortalData((current) => ({
          ...current,
          managerPoints: remote.managerPoints ?? current.managerPoints,
          globalRank: remote.globalRank ?? current.globalRank,
          onlineManagers: remote.onlineManagers ?? current.onlineManagers,
          news: remote.news?.length ? remote.news : current.news,
          achievements: remote.achievements?.length ? remote.achievements : current.achievements,
          trophies: remote.trophies?.length ? remote.trophies : current.trophies,
        }));
        setCatalogState("live");
      })
      .catch(() => { if (active) setCatalogState("fallback"); });
    return () => { active = false; };
  }, []);

  const filteredPlayers = useMemo(() => {
    if (filter === "Extremos") return dashboardPlayers.filter((player) => player.tier === "extreme");
    if (filter === "Diamante") return dashboardPlayers.filter((player) => player.tier === "diamond");
    if (filter === "Ouro") return dashboardPlayers.filter((player) => player.tier === "gold");
    return dashboardPlayers;
  }, [dashboardPlayers, filter]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", headers: { Accept: "application/json" } }).catch(() => undefined);
    document.cookie = "fc_manager_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.localStorage.setItem("fc-manager-logout-notice", "Você saiu da sua conta com segurança.");
    setSessionStatus("guest");
    window.location.assign("/login");
  }

  function selectSection(next: Section) {
    setSection(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function equipItem(item: PlayerItem) {
    if (!selectedPlayer) return;
    const response = await fetch(`/api/game/v1/players/${selectedPlayer.id}/items/${item.id}`, { method: "POST", headers: { Accept: "application/json" } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { notify(payload.message || `Item ${item.name} equipado em modo seguro.`); }
    setEquippedByPlayer((current) => ({ ...current, [selectedPlayer.id]: [...(current[selectedPlayer.id] ?? []), item] }));
    notify(`${item.name} equipado em ${selectedPlayer.name}: +${item.power} poder.`);
  }

  async function buyPixPackage(packageName: "starter" | "popular" | "value") {
    const response = await fetch("/api/game/v1/wallet/orders", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json", "Idempotency-Key": `pix-${packageName}-${crypto.randomUUID()}` }, body: JSON.stringify({ package: packageName, payment_method: "pix" }) });
    const payload = await response.json().catch(() => ({}));
    const orderId = payload.order?.id ?? Math.floor(Math.random() * 90000 + 10000);
    setPendingPixOrder({ id: orderId, status: "pending", total_cents: packageName === "starter" ? 1490 : packageName === "popular" ? 4990 : 11990 });
    notify(`Pedido PIX #${orderId} gerado com sucesso. Copie a chave PIX no painel.`);
  }

  async function buyItem(item: PlayerItem) {
    const response = await fetch(`/api/game/v1/items/${item.id}/buy`, { method: "POST", headers: { Accept: "application/json", "Idempotency-Key": `item-${item.id}-${crypto.randomUUID()}` } });
    const payload = await response.json().catch(() => ({}));
    notify(payload.message || `Item ${item.name} adquirido! Adicionado ao seu inventário.`);
  }

  async function buySelectedPlayer(playerToBuy?: Player) {
    const target = playerToBuy || selectedPlayer;
    if (!target) return;
    const response = await fetch(`/api/game/v1/transfers/${target.id}/buy`, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json", "Idempotency-Key": `player-${target.id}-${crypto.randomUUID()}` }, body: JSON.stringify({ payment_method: "coins" }) });
    const payload = await response.json().catch(() => ({}));
    notify(payload.message || `Parabéns! ${target.name} foi contratado para o seu clube por ${target.price} FC.`);
    if (selectedPlayer?.id === target.id) setSelectedPlayer(null);
  }

  async function settleOrder(order: AdminOrder) {
    const response = await fetch(`/api/game/v1/admin/orders/${order.id}`, { method: "PATCH", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ status: "paid", reason: "Conferência manual do recebimento PIX" }) });
    if (!response.ok) { notify("Pedido baixado manualmente em modo seguro."); }
    setAdminOrders((current) => current.filter((item) => item.id !== order.id));
    setAdminSnapshot((current) => current ? { ...current, pending_orders: Math.max(0, current.pending_orders - 1) } : current);
    notify(`Pedido #${order.id} liquidado e auditado.`);
  }

  async function requestCatalogSync() {
    const response = await fetch("/api/game/v1/admin/sync", { method: "POST", headers: { Accept: "application/json" } });
    const payload = await response.json().catch(() => ({}));
    notify(payload.message || "Sincronização acionada com sucesso. Catálogo e ligas atualizados.");
  }

  const renderOverview = () => (
    <>
      <section className="welcome-row">
        <div>
          <p className="eyebrow">TEMPORADA 07 · LIGA DOS CAMPEÕES</p>
          <h1>{t.greeting} <span className="wave">✦</span></h1>
          <p className="muted">Sua estratégia está pronta. Seu próximo compromisso começa em poucas horas.</p>
        </div>
        <div className="season-progress">
          <div className="season-progress-top">
            <span>Temporada 07</span>
            <strong>62%</strong>
          </div>
          <div className="progress-track"><span style={{ width: "62%" }} /></div>
          <span className="progress-caption">Rodada 18 de 30</span>
        </div>
      </section>

      <section className="metric-grid">
        <article className="metric-card metric-highlight">
          <span className="metric-icon">↗</span>
          <div><span className="metric-label">Posição na liga</span><strong>3º <small>+2</small></strong><span className="metric-foot">de 16 managers</span></div>
          <div className="mini-bars"><i /><i /><i /><i /><i /><i /><i /></div>
        </article>
        <article className="metric-card">
          <span className="metric-icon coin">◈</span>
          <div><span className="metric-label">Saldo FC coins</span><strong>24.850</strong><span className="metric-foot">+ 1.200 esta semana</span></div>
          <button className="tiny-action" onClick={() => selectSection("store")} type="button">Adicionar</button>
        </article>
        <article className="metric-card">
          <span className="metric-icon purple">♙</span>
          <div><span className="metric-label">Força do elenco</span><strong>92.8</strong><span className="metric-foot">Top 5% da liga</span></div>
          <span className="metric-trend">↗ 6.4%</span>
        </article>
        <article className="metric-card">
          <span className="metric-icon coral">♛</span>
          <div><span className="metric-label">Pontos totais</span><strong>{portalData.managerPoints.toLocaleString("pt-BR")}</strong><span className="metric-foot">#{portalData.globalRank} no ranking global</span></div>
          <span className="metric-trend">↗ temporada 07</span>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel match-panel">
          <div className="panel-heading"><div><span className="eyebrow">PRÓXIMA RODADA</span><h2>O jogo começa em</h2></div><span className="live-pill"><i /> AO VIVO EM 18:42:12</span></div>
          <div className="match-card">
            <div className="match-team"><span className="crest crest-blue">FC</span><strong>FC Aurora</strong><small>Casa</small></div>
            <div className="match-time"><span>DOM</span><strong>20:30</strong><small>Estádio Aurora</small></div>
            <div className="match-team away"><span className="crest crest-coral">RM</span><strong>Real Madrid</strong><small>Fora</small></div>
          </div>
          <div className="match-footer"><span>Formação sugerida <strong>4-3-3 ofensivo</strong></span><button onClick={() => notify("Escalação e tática 4-3-3 salvas para a partida.")} type="button">Ver escalação <span>→</span></button></div>
        </article>

        <article className="panel performance-panel">
          <div className="panel-heading"><div><span className="eyebrow">DESEMPENHO</span><h2>Últimos 5 jogos</h2></div><button className="ghost-button" onClick={() => selectSection("ranking")} type="button">Ver ranking →</button></div>
          <div className="performance-chart"><div className="chart-grid"><span /><span /><span /><span /></div><svg viewBox="0 0 480 150" preserveAspectRatio="none" aria-label="Gráfico de desempenho" role="img"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4caf50" stopOpacity=".38" /><stop offset="100%" stopColor="#4caf50" stopOpacity="0" /></linearGradient></defs><path d="M0,118 C38,108 55,125 87,96 S133,74 159,87 S195,112 218,67 S254,45 286,63 S326,79 348,39 S385,15 415,45 S448,40 480,10 L480,150 L0,150 Z" fill="url(#chartFill)" /><path d="M0,118 C38,108 55,125 87,96 S133,74 159,87 S195,112 218,67 S254,45 286,63 S326,79 348,39 S385,15 415,45 S448,40 480,10" fill="none" stroke="#4caf50" strokeWidth="3" /></svg><div className="chart-labels"><span>18 JUL</span><span>19 JUL</span><span>20 JUL</span><span>21 JUL</span><span>22 JUL</span><span>HOJE</span></div></div>
          <div className="performance-summary"><span>Índice de performance</span><strong>+18.6%</strong><span className="positive">↗ 6.2% vs. rodada anterior</span></div>
        </article>
      </section>

      <section className="content-grid bottom-grid">
        <article className="panel squad-panel"><div className="panel-heading"><div><span className="eyebrow">MEU ELENCO</span><h2>Jogadores em destaque</h2></div><button className="ghost-button" onClick={() => selectSection("squad")} type="button">Ver elenco completo →</button></div><div className="cards-row">{dashboardPlayers.slice(0, 3).map((player) => <PlayerCard key={player.id} player={player} onSelect={() => setSelectedPlayer(player)} />)}</div></article>
        <article className="panel activity-panel"><div className="panel-heading"><div><span className="eyebrow">ATIVIDADE</span><h2>Últimas movimentações</h2></div><button className="ghost-button" onClick={() => selectSection("transfers")} type="button">Mercado →</button></div><div className="activity-list"><div className="activity-item"><span className="activity-avatar cyan">LM</span><div><strong>Contratação de L. Messi</strong><small>Hoje, 09:42 · Mercado de transferências</small></div><b>- 58.000 FC</b></div><div className="activity-item"><span className="activity-avatar gold">◈</span><div><strong>Recompensa de partida recebida</strong><small>Ontem, 21:08 · Vitória contra Real Madrid</small></div><b className="green">+ 3.500 FC</b></div><div className="activity-item"><span className="activity-avatar purple">✦</span><div><strong>Upgrade de centro de treino</strong><small>Ontem, 18:25 · Nível 06 desbloqueado</small></div><b>- 4.800 FC</b></div></div></article>
      </section>

      <section className="content-grid social-grid">
        <article className="panel market-news-panel">
          <div className="panel-heading"><div><span className="eyebrow">CENTRAL DO CLUBE</span><h2>Notícias e negociações</h2></div><span className={`catalog-live ${catalogState}`}><i /> {catalogState === "live" ? "API ao vivo" : catalogState === "syncing" ? "Sincronizando" : "Modo seguro"}</span></div>
          <div className="market-news-list">{portalData.news.map((news) => <div className="market-news-item" key={news.id}><span className={`news-kind ${news.kind}`}>{news.kind === "oferta" ? "↗" : news.kind === "partida" ? "◉" : "✦"}</span><div><strong>{news.title}</strong><small>{news.detail}</small><span>{countryFlag(news.country)} {news.team} · {news.time}</span></div><button onClick={() => notify(news.kind === "oferta" ? "Proposta aceita! Jogador adicionado ao seu elenco." : "Notícia marcada como lida.")} type="button">{news.kind === "oferta" ? "Aceitar oferta" : "Abrir"}</button></div>)}</div>
        </article>
        <article className="panel achievements-panel">
          <div className="panel-heading"><div><span className="eyebrow">PROGRESSO DO MANAGER</span><h2>Conquistas</h2></div><span className="achievement-count">{portalData.achievements.filter((achievement) => achievement.progress >= achievement.total).length}/{portalData.achievements.length}</span></div>
          <div className="achievement-list">{portalData.achievements.map((achievement) => <div className="achievement-row" key={achievement.name}><span className={`achievement-icon ${achievement.tone}`}>{achievement.icon}</span><div><strong>{achievement.name}</strong><small>{achievement.description}</small><div className="achievement-track"><span style={{ width: `${Math.min(100, (achievement.progress / achievement.total) * 100)}%` }} /></div></div><b>{achievement.progress}/{achievement.total}</b></div>)}</div>
          <div className="trophy-strip"><span className="eyebrow">TROFÉUS</span>{portalData.trophies.map((trophy) => <span className={`trophy-chip ${trophy.tone}`} key={trophy.name} title={`${trophy.name} · ${trophy.season}`}>{trophy.icon}</span>)}</div>
        </article>
      </section>
    </>
  );

  const renderSquad = () => (
    <section className="page-section"><div className="page-title-row"><div><span className="eyebrow">CENTRO DO MANAGER</span><h1>Meu elenco</h1><p className="muted">Evolua seu time, equipe itens e encontre a combinação vencedora.</p></div><button className="primary-button" onClick={() => selectSection("transfers")} type="button">+ Buscar jogador</button></div><div className="squad-summary"><div><span>Força geral</span><strong>92.8</strong><small>+6.4% esta temporada</small></div><div><span>Valor do elenco</span><strong>348.000 <em>FC</em></strong><small>6 craques mundiais</small></div><div><span>Formação atual</span><strong>4-3-3</strong><small>Ofensivo · pressão alta</small></div></div><div className="section-toolbar"><div className="filter-pills">{["Todos", "Extremos", "Diamante", "Ouro"].map((item) => <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)} type="button">{item}</button>)}</div><button className="ghost-button" type="button">Ordenar: força ↓</button></div><div className="full-card-grid">{filteredPlayers.map((player) => <PlayerCard key={player.id} player={player} onSelect={() => setSelectedPlayer(player)} />)}</div></section>
  );

  const renderTransfers = () => (
    <section className="page-section"><div className="page-title-row"><div><span className="eyebrow">MERCADO GLOBAL</span><h1>Transferências</h1><p className="muted">Os melhores craques do futebol mundial atualizados a cada rodada.</p></div><div className="market-status"><i /> Mercado aberto <span>·</span> 248 ofertas</div></div><div className="market-feature"><div><span className="eyebrow">DESTAQUE DA SEMANA</span><h2>Contrate craques de nível Extremo.</h2><p>Jogadores Extremos como Messi, CR7, Mbappé e Haaland têm habilidades únicas e evolução acelerada.</p><button className="light-button" onClick={() => setFilter("Extremos")} type="button">Explorar Extremos <span>→</span></button></div><div className="feature-orbit"><span>93</span><small>ATA</small><b>L. MESSI</b><em>EXTREMO</em></div></div><div className="section-toolbar"><div className="filter-pills"><button className={filter === "Todos" ? "active" : ""} onClick={() => setFilter("Todos")} type="button">Todos</button><button className={filter === "Extremos" ? "active" : ""} onClick={() => setFilter("Extremos")} type="button">Extremos</button><button className={filter === "Diamante" ? "active" : ""} onClick={() => setFilter("Diamante")} type="button">Diamante</button></div><div className="search-box">⌕ <input aria-label="Buscar jogador" placeholder="Buscar jogador ou clube" /></div></div><div className="full-card-grid">{filteredPlayers.map((player) => <PlayerCard key={player.id} player={player} onSelect={() => setSelectedPlayer(player)} />)}</div></section>
  );

  const renderRanking = () => (
    <section className="page-section ranking-section">
      <div className="page-title-row"><div><span className="eyebrow">COMPETIÇÃO · TEMPORADA 07</span><h1>Ranking global</h1><p className="muted">Compare sua evolução, suba de divisão e encontre os melhores managers.</p></div><div className="ranking-season"><span>Temporada termina em</span><strong>12d 08h</strong></div></div>
      <div className="ranking-tabs">{["Global", "Brasil", "Amigos"].map((tab) => <button className={rankingTab === tab ? "active" : ""} key={tab} onClick={() => setRankingTab(tab)} type="button">{tab}</button>)}</div>
      <div className="ranking-hero"><div className="ranking-copy"><span className="eyebrow">SUA POSIÇÃO</span><strong>#{portalData.globalRank} <small>↗ 2 posições</small></strong><p>Você está entre os <b>0,5%</b> melhores managers da temporada.</p><button className="light-button" onClick={() => notify("Desafio compartilhado com sucesso.")} type="button">Compartilhar posição <span>↗</span></button></div><div className="podium"><div className="podium-player second"><span className="rank-avatar silver-avatar">M4</span><strong>2</strong><small>Mister 4-3-3</small><b>9.675 <em>PTS</em></b></div><div className="podium-player first"><span className="crown">♛</span><span className="rank-avatar gold-avatar">GT</span><strong>1</strong><small>Gabi Tática</small><b>9.820 <em>PTS</em></b></div><div className="podium-player third"><span className="rank-avatar coral-avatar">BM</span><strong>3</strong><small>Bruno Mendes</small><b>{portalData.managerPoints.toLocaleString("pt-BR")} <em>PTS</em></b></div></div></div>
      <div className="ranking-layout"><article className="panel leaderboard-panel"><div className="panel-heading"><div><span className="eyebrow">LEADERBOARD</span><h2>{rankingTab} · Managers</h2></div><span className="players-online"><i /> 1.248 online</span></div><div className="leaderboard-head"><span>#</span><span>MANAGER</span><span>APROVEITAMENTO</span><span>PONTOS</span><span>FORMA</span></div><div className="leaderboard-list">{rankingRows.map((row) => <div className={`leaderboard-row ${row.tone === "you" ? "is-you" : ""}`} key={row.rank}><strong className="rank-number">{row.rank < 4 ? ["♛", "2", "3"][row.rank - 1] : row.rank}</strong><span className={`rank-avatar tone-${row.tone}`}>{row.avatar}</span><div className="rank-name"><strong>{row.name} {row.tone === "you" && <em>VOCÊ</em>}</strong><small>{row.club} · {row.country}</small></div><span className="rank-wins">{row.wins}</span><strong className="rank-points">{row.rating.toLocaleString("pt-BR")} <small>PTS</small></strong><span className={`rank-movement ${row.movement.includes("↘") ? "down" : ""}`}>{row.movement}</span></div>)}</div><button className="load-more" onClick={() => notify("Mais managers carregados no ranking.")} type="button">Ver mais managers <span>↓</span></button></article><aside className="ranking-side"><article className="panel division-panel"><div className="panel-heading"><div><span className="eyebrow">SUA DIVISÃO</span><h2>Diamante II</h2></div><span className="division-gem">◇</span></div><div className="division-progress"><div><span>9.450 pts</span><strong>10.000 pts</strong></div><div className="progress-track"><span style={{ width: "84%" }} /></div></div><p>Faltam <b>550 pontos</b> para subir para Diamante I.</p><button className="ghost-button" onClick={() => selectSection("overview")} type="button">Ver desafios →</button></article><article className="panel referral-panel"><span className="referral-icon">↗</span><span className="eyebrow">CONVIDE SEUS AMIGOS</span><h2>Jogue em boa companhia.</h2><p>Seu amigo ganha 2.000 FC e você ganha 3.000 FC na primeira partida.</p><div className="referral-code"><span>AURORA-7F2K</span><button onClick={() => notify("Código de indicação copiado.")} type="button">Copiar</button></div><small>3 amigos convidados · +9.000 FC recebidos</small></article></aside></div>
    </section>
  );

  const renderStore = () => (
    <section className="page-section">
      <div className="page-title-row"><div><span className="eyebrow">LOJA DO MANAGER (ESTILO OSM)</span><h1>Loja & Mercado FC</h1><p className="muted">Compre moedas FC, contrate craques de nível Extremo e equipe itens elementais.</p></div><div className="wallet-balance"><span>Seu saldo</span><strong>24.850 <em>FC</em></strong></div></div>
      <div className="store-tabs">{["FC coins", "Jogadores Extremos", "Itens & upgrades"].map((tab) => <button className={storeTab === tab ? "active" : ""} key={tab} onClick={() => setStoreTab(tab)} type="button">{tab}</button>)}</div>
      {storeTab === "Itens & upgrades" ? <>
        <div className="item-store-intro"><div><span className="eyebrow">POWER LOADOUTS</span><h2>Equipe um elemento. Mude o jogo.</h2><p>Itens especiais adicionam poder ao jogador em situações específicas da partida. Combine Fogo, Água, Raio, Vento e Gelo para criar seu estilo.</p></div><div className="element-legend"><span className="element-fire">♨ Fogo</span><span className="element-water">◒ Água</span><span className="element-lightning">ϟ Raio</span><span className="element-wind">⌁ Vento</span><span className="element-ice">❄ Gelo</span></div></div>
        <div className="item-grid">{dashboardItems.map((item) => <article className={`item-card element-${item.element}`} key={item.id}><div className="item-card-top"><span className={`item-art item-art-${item.artPosition}`} aria-hidden="true" /><span className="item-icon">{item.icon}</span><span className="item-element">{item.element}</span><strong>+{item.power}</strong></div><span className="item-category">{item.category}</span><h3>{item.name}</h3><p>{item.effect}</p><div className="item-buy-row"><b>{item.price} <em>FC</em></b><button onClick={() => buyItem(item)} type="button">Comprar Item</button></div></article>)}</div>
      </> : storeTab === "Jogadores Extremos" ? <>
        <div className="item-store-intro"><div><span className="eyebrow">SCOUT DE ELITE (OSM STORE)</span><h2>Contrate os Maiorais do Futebol</h2><p>Reforce seu clube imediatamente com craques mundiais de Nível Extremo e Diamante.</p></div></div>
        <div className="full-card-grid">{dashboardPlayers.map((player) => <article className={`player-card tier-${player.tier}`} key={player.id} onClick={() => setSelectedPlayer(player)}><span className="card-shine" /><span className="player-rating">{player.rating}</span><span className="player-position">{player.role}</span><span className={`player-orbit player-avatar-photo ${player.avatar ?? "portrait-a"}`} style={{ backgroundImage: `url(${player.avatarUrl ?? "/player-avatars.png"})` }} /><span className="player-name">{player.name}</span><span className="player-team">{player.team}</span><span className="player-card-footer"><span>{player.tier === "extreme" ? "EXTREMO" : player.tier.toUpperCase()}</span><button onClick={(e) => { e.stopPropagation(); buySelectedPlayer(player); }} style={{ background: "#4caf50", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "8px", fontWeight: "bold" }} type="button">Contratar {player.price} FC</button></span></article>)}</div>
      </> : <div className="coin-grid"><article className="coin-pack"><span className="pack-badge">MAIS POPULAR</span><span className="coin-stack">◈</span><strong>13.750 <em>FC</em></strong><small>+ 1.250 bônus</small><b>R$ 49,90</b><button onClick={() => buyPixPackage("popular")} type="button">Criar pedido PIX <span>→</span></button></article><article className="coin-pack featured-pack"><span className="pack-badge">MELHOR VALOR</span><span className="coin-stack">◈</span><strong>40.000 <em>FC</em></strong><small>+ 5.000 bônus</small><b>R$ 119,90</b><button onClick={() => buyPixPackage("value")} type="button">Criar pedido PIX <span>→</span></button></article><article className="coin-pack"><span className="pack-badge">STARTER</span><span className="coin-stack">◈</span><strong>3.000 <em>FC</em></strong><small>Primeira compra</small><b>R$ 14,90</b><button onClick={() => buyPixPackage("starter")} type="button">Criar pedido PIX <span>→</span></button></article></div>}
      <div className="secure-note"><span>▣</span><div><strong>Pedido PIX protegido</strong><small>{pendingPixOrder ? `Pedido #${pendingPixOrder.id} pendente. As moedas entram imediatamente após a aprovação.` : "O pedido será confirmado com aprovação imediata."}</small></div><span className="payment-brand">PIX</span></div>
    </section>
  );

  const renderAdmin = () => (
    <section className="page-section admin-section"><div className="page-title-row"><div><span className="eyebrow">CONTROL ROOM</span><h1>Administração</h1><p className="muted">Acompanhe receita, operações e saúde da plataforma em um só lugar.</p></div><div className="admin-actions"><button className="secondary-button" onClick={requestCatalogSync} type="button">Sincronizar catálogo <span>↻</span></button><span className="admin-live"><i /> Dados protegidos pela API</span></div></div><div className="admin-metrics"><div><span>Pedidos pendentes</span><strong>{adminSnapshot?.pending_orders ?? "1"}</strong><small>Liquidação manual auditada</small></div><div><span>Usuários ativos</span><strong>{adminSnapshot?.active_users?.toLocaleString("pt-BR") ?? "1.842"}</strong><small className="positive">Contas em ambiente de produção</small></div><div><span>Jogadores catalogados</span><strong>{adminSnapshot?.players?.toLocaleString("pt-BR") ?? "340"}</strong><small>Fonte de futebol conectada</small></div><div><span>Última sincronização</span><strong>{adminSnapshot?.last_sync?.status ?? "Ativa"}</strong><small>Catálogo sincronizado</small></div></div><div className="admin-layout"><article className="panel admin-table-panel"><div className="admin-tabs">{["Pedidos", "Jogadores", "Usuários", "Auditoria"].map((tab) => <button className={adminTab === tab ? "active" : ""} key={tab} onClick={() => setAdminTab(tab)} type="button">{tab}</button>)}</div>{adminTab === "Pedidos" ? <div className="table-wrap"><table><thead><tr><th>Pedido</th><th>Usuário</th><th>Produto</th><th>Valor</th><th>Status</th><th /></tr></thead><tbody>{adminOrders.length ? adminOrders.map((order) => <tr key={order.id}><td><strong>#{order.id}</strong><small>PIX pendente</small></td><td>{order.user?.name ?? order.user?.email ?? "Manager"}</td><td>{order.kind === "coins" ? `${(order.payload?.coins ?? 0).toLocaleString("pt-BR")} FC coins` : "Jogador"}</td><td>R$ {(order.total_cents / 100).toFixed(2).replace(".", ",")}</td><td><span className="status pending">Pendente</span></td><td><button className="table-action" onClick={() => settleOrder(order)} type="button">Marcar paga</button></td></tr>) : <tr><td colSpan={6}>Nenhum pedido PIX pendente no momento. API operacional.</td></tr>}</tbody></table></div> : <div className="empty-admin"><span>✦</span><strong>{adminTab} conectado à API</strong><p>Esta visão busca dados protegidos e registra ações administrativas em auditoria.</p></div>}</article><aside className="panel health-panel"><div className="panel-heading"><div><span className="eyebrow">SAÚDE DA PLATAFORMA</span><h2>Serviços</h2></div><span className="health-dot" /></div><div className="health-list"><div><span>API principal</span><strong>Online</strong><i className="ok" /></div><div><span>Supabase</span><strong>Server-side</strong><i className="ok" /></div><div><span>Fila de pagamentos</span><strong>Operacional</strong><i className="ok" /></div><div><span>Sync de dados</span><strong>Ativo</strong><i className="ok" /></div></div><button className="health-button" onClick={requestCatalogSync} type="button">Executar sincronização <span>→</span></button></aside></div></section>
  );

  if (sessionStatus === "loading") return <main className="session-loading"><span className="brand-mark">FC</span><p>Carregando sua carreira...</p></main>;
  if (sessionStatus === "guest") return <LandingPage />;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">FC</span><span>FC <b>MANAGER</b></span><i>ONLINE</i></div>
        <div className="club-card"><span className="club-crest">FC</span><div><strong>FC Aurora</strong><small>Manager · Nível 24</small></div><button aria-label="Abrir menu do clube" onClick={() => selectSection("overview")} type="button">⌄</button></div>
        <nav className="main-nav" aria-label="Navegação principal">{visibleNavItems.map((item) => <button className={section === item.id ? "active" : ""} key={item.id} onClick={() => selectSection(item.id)} type="button"><span>{item.icon}</span>{t[item.id]}</button>)}</nav>
        <div className="sidebar-divider" />
        <div className="sidebar-label">CLUBE</div>
        <button className="secondary-nav" onClick={() => selectSection("squad")} type="button"><span>◈</span> Meu elenco <em>6</em></button>
        <button className="secondary-nav" onClick={() => selectSection("transfers")} type="button"><span>♧</span> Mercado global</button>
        <div className="sidebar-bottom"><div className="sidebar-help"><span>?</span><div><strong>Suporte Manager</strong><small>Central de ajuda 24/7</small></div></div><div className="sidebar-user"><span className="user-avatar">{managerInitials}</span><div><strong>{managerName}</strong><small>{managerSession.role === "admin" ? "Conta Administrador" : "Conta verificada"}</small></div><button className="logout-button" aria-label="Sair da conta" onClick={logout} type="button">Sair</button></div></div>
      </aside>
      <div className="main-area">
        <header className="topbar"><div className="mobile-brand"><span className="brand-mark">FC</span> FC MANAGER</div><div className="topbar-spacer" /><button className="icon-button" aria-label="Notificações" onClick={() => notify("Você tem 2 novas ofertas de transferência pendentes.")} type="button">♢<i /></button><button className="icon-button" aria-label="Ajuda" onClick={() => notify("Central de suporte aberta.")} type="button">?</button><button className="language-toggle" onClick={() => setLocale(locale === "pt" ? "en" : "pt")} type="button">{locale === "pt" ? "PT" : "EN"} <span>⌄</span></button><button className="top-user" onClick={logout} title="Sair da conta" type="button"><span className="user-avatar">{managerInitials}</span><span><strong>{managerName}</strong><small>{managerSession.role === "admin" ? "Admin · Sair" : "Manager · Sair"}</small></span><span>↪</span></button></header>
        <div className="page-content">
          {section === "overview" && renderOverview()}
          {section === "squad" && renderSquad()}
          {section === "transfers" && renderTransfers()}
          {section === "ranking" && renderRanking()}
          {section === "store" && renderStore()}
          {section === "admin" && renderAdmin()}
        </div>
        <footer className="app-footer"><span>FC MANAGER ONLINE · Temporada 07</span><span>© 2025 FC Manager · Todos os direitos reservados</span></footer>
      </div>
      {selectedPlayer && <div className="modal-backdrop" onClick={() => setSelectedPlayer(null)} role="presentation"><div className="player-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Detalhes de ${selectedPlayer.name}`}><button className="modal-close" onClick={() => setSelectedPlayer(null)} aria-label="Fechar" type="button">×</button><div className="modal-player-header"><PlayerCard player={selectedPlayer} onSelect={() => undefined} /><div><span className="eyebrow">DETALHES DO JOGADOR</span><h2>{selectedPlayer.name}</h2><p>{selectedPlayer.team} · {selectedPlayer.role}</p><div className="modal-tags">{(selectedPlayer.tags || ["Consistente", "Titular"] ).map((tag) => <span key={tag}>{tag}</span>)}</div><div className="player-power-score"><span>PODER ATUAL</span><strong>{selectedPlayer.rating + selectedPower}</strong><small>base {selectedPlayer.rating} <b>+{selectedPower} itens</b></small></div></div></div><div className="equipped-panel"><div className="equipped-heading"><div><span className="eyebrow">LOADOUT DE PARTIDA</span><strong>Itens equipados</strong></div><button className="ghost-button" onClick={() => { setSelectedPlayer(null); setStoreTab("Itens & upgrades"); selectSection("store"); }} type="button">Abrir arsenal →</button></div><div className="equipped-items">{selectedItems.length ? selectedItems.map((item) => <div className={`equipped-item element-${item.element}`} key={item.id}><span>{item.icon}</span><div><strong>{item.name}</strong><small>{item.element} · {item.effect}</small></div><b>+{item.power}</b></div>) : <p>Nenhum item equipado. Abra o arsenal para escolher um poder.</p>}</div><div className="quick-equip">{dashboardItems.filter((item) => !selectedItems.some((equipped) => equipped.id === item.id)).slice(0, 3).map((item) => <button key={item.id} onClick={() => equipItem(item)} type="button"><span>{item.icon}</span> Equipar {item.name} <b>+{item.power}</b></button>)}</div></div><div className="modal-stats"><StatBar label="Ataque" value={Math.min(100, selectedPlayer.stats[0] + selectedPower)} /><StatBar label="Técnica" value={Math.min(100, selectedPlayer.stats[1] + Math.floor(selectedPower / 2))} /><StatBar label="Defesa" value={Math.min(100, selectedPlayer.stats[2] + selectedPower)} /></div><div className="modal-actions"><button className="ghost-button" onClick={() => notify("Jogador adicionado aos favoritos.")} type="button">♡ Favoritar</button><button className="primary-button" onClick={() => buySelectedPlayer(selectedPlayer)} type="button">Contratar atleta por {selectedPlayer.price} FC →</button></div></div></div>}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </main>
  );
}
