"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useCatalog } from "./catalog";

/* =========================================================================
   TYPES
   ========================================================================= */
type MatchPlayer = {
  id: string;
  x: number;
  y: number;
  team: "home" | "away";
  pos: string;
  name: string;
};

type MatchEvent = {
  minute: number;
  type: string;
  text: string;
};

type MatchTick = {
  type: string;
  minute: number;
  homeScore: number;
  awayScore: number;
  homePower: number;
  awayPower: number;
  ballX: number;
  ballY: number;
  status: "live" | "halftime" | "finished";
  players: MatchPlayer[];
  events: MatchEvent[];
  scoreDelta?: { home: number; away: number };
};

type Tactic = "atk" | "bal" | "def";
type Formation = "4-4-2" | "4-3-3" | "3-5-2" | "5-3-2";

/* =========================================================================
   SHARED API STATUS
   ========================================================================= */
function ApiStatus({ state }: { state: "loading" | "fallback" | "live" }) {
  if (state === "loading") return <span className="api-badge loading"><i /> Conectando...</span>;
  if (state === "fallback") return <span className="api-badge fallback"><i /> Demo</span>;
  return <span className="api-badge live"><i /> Ao Vivo</span>;
}

/* =========================================================================
   SIDEBAR NAV
   ========================================================================= */
export function GameNav() {
  const path = usePathname();
  
  const nav = [
    { href: "/career",        icon: "🏠", label: "Clube" },
    { href: "/lineup",        icon: "⚽", label: "Tática" },
    { href: "/live-match",    icon: "🏟", label: "Jogar" },
    { href: "/transfer-list", icon: "↗",  label: "Mercado" },
    { href: "/store",         icon: "💎", label: "Loja" },
    { href: "/admin",         icon: "⚙",  label: "Admin" },
  ];

  return (
    <nav className="game-bottom-nav" aria-label="Navegação principal">
      {nav.map(({ href, icon, label }) => (
        <Link
          key={href}
          href={href}
          className={path === href || path.startsWith(href + "/") ? "active" : ""}
          title={label}
        >
          <span className="nav-icon">{icon}</span>
          <span className="nav-label">{label}</span>
        </Link>
      ))}
    </nav>
  );
}

/* =========================================================================
   TOPBAR
   ========================================================================= */
export function GameTopbar({
  title,
  kicker,
}: {
  title: string;
  kicker: string;
}) {
  const { catalog, apiState } = useCatalog();

  return (
    <header className="game-topbar">
      <div className="topbar-page-info">
        <span className="topbar-eyebrow">{kicker}</span>
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-actions">
        <ApiStatus state={apiState === "syncing" ? "loading" : apiState === "live" ? "live" : "fallback"} />
        <div
          className="topbar-coins"
          onClick={() => window.location.assign("/store")}
          role="button"
          tabIndex={0}
          aria-label={`Saldo: ${catalog.wallet?.balance ?? 24850} FC`}
        >
          <span className="coin-icon">◈</span>
          <b>{(catalog.wallet?.balance ?? 24850).toLocaleString("pt-BR")}</b>
          <small>FC</small>
        </div>
        <button
          className="topbar-add-coins"
          onClick={() => window.location.assign("/store")}
          type="button"
        >
          + Comprar
        </button>
      </div>
    </header>
  );
}

/* =========================================================================
   GAME FRAME WRAPPER
   ========================================================================= */
async function signOutManager() {
  await fetch("/api/auth/logout", { method: "POST", headers: { Accept: "application/json" } }).catch(
    () => undefined
  );
  document.cookie = "fc_manager_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  window.localStorage.removeItem("fc-manager-logout-notice");
  window.location.assign("/login");
}

export function GameFrame({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker: string;
  children: React.ReactNode;
}) {
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error("anonymous");
        setSessionReady(true);
      })
      .catch(() => setSessionReady(true));
  }, []);

  if (!sessionReady) return null;

  return (
    <main className="game-app-fullscreen">
      <GameTopbar title={title} kicker={kicker} />
      <div className="game-content-scrollable">
        {children}
      </div>
      <GameNav />
    </main>
  );
}

/* =========================================================================
   CAREER / DASHBOARD SCREEN
   ========================================================================= */
export function CareerScreen() {
  const { catalog } = useCatalog();

  const recentResults = [
    { opponent: "Porto Legends", score: "2–1", result: "w" },
    { opponent: "Bahia United", score: "0–0", result: "d" },
    { opponent: "São Paulo Kings", score: "3–1", result: "w" },
    { opponent: "Rio Bulls", score: "1–2", result: "l" },
    { opponent: "Mineiro Club", score: "2–0", result: "w" },
  ];

  const topPlayers = [
    { name: "L. Andrade", pos: "ATA", rating: 92, goals: 14, tier: "extreme" },
    { name: "M. Costa", pos: "MEI", rating: 88, goals: 8, tier: "diamond" },
    { name: "R. Nascimento", pos: "ZAG", rating: 84, goals: 2, tier: "gold" },
  ];

  const newsItems = catalog.news.length > 0 ? catalog.news : [
    { id: "n1", kind: "partida", title: "Próxima Partida Confirmada", detail: "FC Aurora × Rio Bulls · Dom, 20:30", time: "amanhã" },
    { id: "n2", kind: "oferta", title: "Nova Proposta por L. Andrade", detail: "Porto Legends oferece 15.200 FC", time: "há 2h" },
    { id: "n3", kind: "trofeu", title: "Conquista Desbloqueada!", detail: "Invicto em casa por 5 rodadas · +300 pts", time: "hoje" },
  ];

  return (
    <GameFrame title="Meu Clube" kicker="CENTRAL DO MANAGER">
      <div>
        {/* Stats row */}
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-label">Posição na Liga</div>
            <div className="stat-big">3º</div>
            <div className="stat-sub positive">↑ +2 esta semana</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon gold">◈</div>
            <div className="stat-label">Saldo FC</div>
            <div className="stat-big">{(catalog.wallet?.balance ?? 24850).toLocaleString("pt-BR")}</div>
            <div className="stat-sub positive">+ 1.200 esta semana</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">⭐</div>
            <div className="stat-label">Pontos Manager</div>
            <div className="stat-big">{catalog.managerPoints.toLocaleString("pt-BR")}</div>
            <div className="stat-sub">Top {catalog.globalRank}° global</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon coral">👥</div>
            <div className="stat-label">Managers Online</div>
            <div className="stat-big">{catalog.onlineManagers.toLocaleString("pt-BR")}</div>
            <div className="stat-sub positive">● Ao vivo agora</div>
          </div>
        </div>

        <div className="career-grid">
          <div className="career-grid-left">
            {/* Next match */}
            <div className="g-panel">
              <div className="panel-title">
                <h2>Próxima Partida</h2>
                <span style={{ fontSize: 9, color: "var(--coral)", fontWeight: 700, letterSpacing: ".1em" }}>
                  AO VIVO EM BREVE
                </span>
              </div>
              <div className="match-preview-card">
                <div className="match-preview-team">
                  <div className="match-preview-crest">FC</div>
                  <strong>FC Aurora</strong>
                  <small>Casa</small>
                </div>
                <div className="match-vs">
                  <span>AO VIVO</span>
                  <strong>VS</strong>
                  <small>Dom · 20:30</small>
                  <div style={{ marginTop: 12 }}>
                    <Link href="/live-match" className="btn-primary">
                      ▶ Entrar na Partida
                    </Link>
                  </div>
                </div>
                <div className="match-preview-team">
                  <div className="match-preview-crest away">RB</div>
                  <strong>Rio Bulls</strong>
                  <small>Visitante</small>
                </div>
              </div>
            </div>

            {/* Recent form */}
            <div className="g-panel">
              <div className="panel-title">
                <h2>Últimos Resultados</h2>
                <div className="form-dots">
                  {recentResults.map((r, i) => (
                    <div key={i} className={`form-dot ${r.result}`} title={`${r.opponent}: ${r.score}`} />
                  ))}
                </div>
              </div>
              {recentResults.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: i < recentResults.length - 1 ? "1px solid var(--green-line)" : "none",
                    fontSize: 12,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: r.result === "w" ? "var(--green-primary)" : r.result === "d" ? "var(--gold)" : "var(--coral)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 9,
                      fontWeight: 900,
                      color: r.result === "w" ? "#031008" : r.result === "d" ? "#201000" : "#2a0a04",
                    }}
                  >
                    {r.result.toUpperCase()}
                  </div>
                  <span style={{ flex: 1, color: "var(--text-secondary)" }}>vs {r.opponent}</span>
                  <strong style={{ fontFamily: "'Saira Condensed'", fontSize: 16, fontWeight: 800 }}>{r.score}</strong>
                </div>
              ))}
            </div>

            {/* Top players */}
            <div className="g-panel">
              <div className="panel-title">
                <h2>Meus Melhores Jogadores</h2>
                <Link href="/lineup" className="btn-ghost" style={{ fontSize: 11 }}>
                  Ver Elenco →
                </Link>
              </div>
              <div className="cards-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {topPlayers.map((p) => (
                  <div key={p.name} className={`holo-card tier-${p.tier}`} tabIndex={0} role="button">
                    <div className="card-tier-badge badge-extreme" style={{ marginBottom: 8 }}>
                      {p.tier.toUpperCase()}
                    </div>
                    <div className="card-rating">{p.rating}</div>
                    <div className="card-position">{p.pos}</div>
                    <div className="card-name" style={{ marginTop: 8 }}>{p.name}</div>
                    <div className="card-stats-row">
                      <div className="card-stat">
                        <span>Gols</span>
                        <strong>{p.goals}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="career-grid-right">
            {/* News feed */}
            <div className="g-panel">
              <div className="panel-title">
                <h2>Notícias do Clube</h2>
              </div>
              <div className="news-list">
                {newsItems.map((n) => (
                  <div key={n.id} className="news-item">
                    <div className={`news-icon ${n.kind}`}>
                      {n.kind === "partida" ? "⚽" : n.kind === "oferta" ? "💰" : "🏆"}
                    </div>
                    <div className="news-body">
                      <strong>{n.title}</strong>
                      <small>{n.detail}</small>
                    </div>
                    <span className="news-time">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="g-panel">
              <div className="panel-title">
                <h2>Conquistas</h2>
              </div>
              <div className="achievement-list">
                {(catalog.achievements.length > 0 ? catalog.achievements : [
                  { name: "Olheiro Global", description: "Contrate atletas de 3 países", progress: 2, total: 3, icon: "🌍", tone: "mint" },
                  { name: "Casa Forte", description: "Vença 10 partidas em casa", progress: 8, total: 10, icon: "🏠", tone: "gold" },
                  { name: "Colecionador", description: "Equipe 5 itens especiais", progress: 3, total: 5, icon: "💎", tone: "coral" },
                ]).map((a, i) => (
                  <div key={i} className="achievement-item">
                    <div className="achievement-icon">{a.icon}</div>
                    <div className="achievement-info">
                      <div className="achievement-name">{a.name}</div>
                      <div className="achievement-desc">{a.description}</div>
                      <div className="achievement-bar-track">
                        <div
                          className="achievement-bar-fill"
                          style={{ width: `${(a.progress / a.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="achievement-pct">
                      {a.progress}/{a.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameFrame>
  );
}

/* =========================================================================
   LINEUP SCREEN
   ========================================================================= */
const FORMATIONS: Record<Formation, { label: string; positions: Array<{ pos: string; x: number; y: number }> }> = {
  "4-4-2": {
    label: "4-4-2 Clássico",
    positions: [
      { pos: "GOL", x: 50, y: 88 },
      { pos: "LD", x: 18, y: 70 },
      { pos: "ZAG", x: 37, y: 70 },
      { pos: "ZAG", x: 63, y: 70 },
      { pos: "LE", x: 82, y: 70 },
      { pos: "MD", x: 18, y: 50 },
      { pos: "MC", x: 37, y: 50 },
      { pos: "MC", x: 63, y: 50 },
      { pos: "ME", x: 82, y: 50 },
      { pos: "ATA", x: 36, y: 27 },
      { pos: "ATA", x: 64, y: 27 },
    ],
  },
  "4-3-3": {
    label: "4-3-3 Ofensivo",
    positions: [
      { pos: "GOL", x: 50, y: 88 },
      { pos: "LD", x: 18, y: 70 },
      { pos: "ZAG", x: 37, y: 70 },
      { pos: "ZAG", x: 63, y: 70 },
      { pos: "LE", x: 82, y: 70 },
      { pos: "MC", x: 30, y: 50 },
      { pos: "MC", x: 50, y: 48 },
      { pos: "MC", x: 70, y: 50 },
      { pos: "PE", x: 18, y: 26 },
      { pos: "CA", x: 50, y: 22 },
      { pos: "PD", x: 82, y: 26 },
    ],
  },
  "3-5-2": {
    label: "3-5-2 Compacto",
    positions: [
      { pos: "GOL", x: 50, y: 88 },
      { pos: "ZAG", x: 27, y: 72 },
      { pos: "ZAG", x: 50, y: 72 },
      { pos: "ZAG", x: 73, y: 72 },
      { pos: "AD", x: 14, y: 52 },
      { pos: "MC", x: 32, y: 50 },
      { pos: "MV", x: 50, y: 48 },
      { pos: "MC", x: 68, y: 50 },
      { pos: "AE", x: 86, y: 52 },
      { pos: "ATA", x: 36, y: 26 },
      { pos: "ATA", x: 64, y: 26 },
    ],
  },
  "5-3-2": {
    label: "5-3-2 Defensivo",
    positions: [
      { pos: "GOL", x: 50, y: 88 },
      { pos: "LD", x: 10, y: 70 },
      { pos: "ZAG", x: 27, y: 72 },
      { pos: "ZAG", x: 50, y: 72 },
      { pos: "ZAG", x: 73, y: 72 },
      { pos: "LE", x: 90, y: 70 },
      { pos: "MC", x: 28, y: 50 },
      { pos: "MC", x: 50, y: 48 },
      { pos: "MC", x: 72, y: 50 },
      { pos: "ATA", x: 36, y: 28 },
      { pos: "ATA", x: 64, y: 28 },
    ],
  },
};

const SQUAD_PLAYERS = [
  { id: 1, name: "E. Vidal", pos: "GOL", rating: 81, tier: "silver" },
  { id: 2, name: "A. Telles", pos: "LD", rating: 79, tier: "silver" },
  { id: 3, name: "R. Nasc.", pos: "ZAG", rating: 84, tier: "gold" },
  { id: 4, name: "T. Silva", pos: "ZAG", rating: 83, tier: "gold" },
  { id: 5, name: "R. Lima", pos: "LE", rating: 80, tier: "silver" },
  { id: 6, name: "C. Sousa", pos: "MC", rating: 82, tier: "gold" },
  { id: 7, name: "M. Costa", pos: "MEI", rating: 88, tier: "diamond" },
  { id: 8, name: "F. Dias", pos: "MD", rating: 80, tier: "silver" },
  { id: 9, name: "L. Gomes", pos: "ME", rating: 81, tier: "silver" },
  { id: 10, name: "L. Andrade", pos: "ATA", rating: 92, tier: "extreme" },
  { id: 11, name: "V. Neto", pos: "ATA", rating: 85, tier: "gold" },
];

export function LineupScreen() {
  const [formation, setFormation] = useState<Formation>("4-4-2");
  const [lineup, setLineup] = useState<Record<number, typeof SQUAD_PLAYERS[0]>>(() => {
    const result: Record<number, typeof SQUAD_PLAYERS[0]> = {};
    SQUAD_PLAYERS.forEach((p, i) => { result[i] = p; });
    return result;
  });
  const [dragging, setDragging] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const positions = FORMATIONS[formation].positions;
  const teamRating = Math.round(
    Object.values(lineup).reduce((sum, p) => sum + (p?.rating ?? 0), 0) /
    Object.values(lineup).filter(Boolean).length
  );

  function handleDragStart(index: number) { setDragging(index); }
  function handleDrop(targetIndex: number) {
    if (dragging === null || dragging === targetIndex) return;
    setLineup((prev) => {
      const next = { ...prev };
      const tmp = next[dragging];
      next[dragging] = next[targetIndex];
      next[targetIndex] = tmp;
      return next;
    });
    setDragging(null);
  }

  function saveLineup() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <GameFrame title="Escalação" kicker="TÁTICA & FORMAÇÃO">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        {/* Pitch */}
        <div>
          {/* Formation selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {(Object.keys(FORMATIONS) as Formation[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormation(f)}
                className={formation === f ? "btn-primary" : "btn-secondary"}
                style={{ minWidth: 100 }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* 3D Pitch */}
          <div
            className="lineup-pitch"
            style={{ height: 520, position: "relative" }}
          >
            <div className="pitch-outer-border" />
            <div className="pitch-center-line" />
            <div className="pitch-center-circle" />
            <div className="pitch-goal-area-top" />
            <div className="pitch-goal-area-bottom" />

            {/* Opponent ghost row */}
            {[20, 35, 50, 65, 80].map((x) => (
              <div
                key={`opp-${x}`}
                className="pos-token away"
                style={{ left: `${x}%`, top: "12%" }}
              >
                <div className="pos-token-circle" style={{ width: 34, height: 34, fontSize: 8 }}>ADV</div>
              </div>
            ))}

            {/* Our positions */}
            {positions.map((slot, i) => {
              const player = lineup[i];
              return (
                <div
                  key={i}
                  className={`pos-token ${!player ? "empty" : ""}`}
                  style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                  draggable={!!player}
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(i)}
                  role="button"
                  tabIndex={0}
                  aria-label={player ? `${player.name} - ${slot.pos}` : `Posição vazia: ${slot.pos}`}
                >
                  <div
                    className="pos-token-circle"
                    style={{
                      background: player
                        ? player.tier === "extreme"
                          ? "linear-gradient(145deg, #c03020, #881808)"
                          : player.tier === "diamond"
                          ? "linear-gradient(145deg, #1060b0, #083080)"
                          : player.tier === "gold"
                          ? "linear-gradient(145deg, #907020, #604010)"
                          : "linear-gradient(145deg, #0f9050, #0b6c3b)"
                        : undefined,
                    }}
                  >
                    {player ? (
                      <>
                        <div style={{ fontFamily: "'Saira Condensed'", fontSize: 14, fontWeight: 900, lineHeight: 1 }}>
                          {player.rating}
                        </div>
                        <div style={{ fontSize: 7 }}>{slot.pos}</div>
                      </>
                    ) : (
                      <span style={{ fontSize: 10 }}>+</span>
                    )}
                  </div>
                  {player && (
                    <div className="pos-token-label">
                      {player.name.split(" ")[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Drag hint */}
          <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 10, textAlign: "center" }}>
            Arraste os jogadores para trocar posições
          </p>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Team rating */}
          <div className="g-panel" style={{ textAlign: "center" }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Rating do Time</div>
            <div style={{ fontFamily: "'Saira Condensed'", fontSize: 52, fontWeight: 900, color: "var(--green-primary)", lineHeight: 1 }}>
              {teamRating}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
              {FORMATIONS[formation].label}
            </div>
            <button
              className="btn-primary"
              style={{ width: "100%", marginTop: 14, justifyContent: "center" }}
              onClick={saveLineup}
            >
              {saved ? "✓ Salvo!" : "💾 Salvar Escalação"}
            </button>
            <Link
              href="/live-match"
              className="btn-secondary"
              style={{ width: "100%", marginTop: 8, justifyContent: "center", display: "flex" }}
            >
              ▶ Jogar Agora
            </Link>
          </div>

          {/* Player list */}
          <div className="g-panel" style={{ flex: 1, overflow: "auto" }}>
            <div className="panel-title">
              <h3 style={{ fontSize: 13 }}>Elenco</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SQUAD_PLAYERS.map((p) => (
                <div
                  key={p.id}
                  draggable
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: "var(--bg-panel-2)",
                    border: "1px solid var(--green-line)",
                    cursor: "grab",
                    transition: "all var(--transition)",
                    fontSize: 12,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background:
                        p.tier === "extreme" ? "linear-gradient(145deg,#c03020,#881808)"
                        : p.tier === "diamond" ? "linear-gradient(145deg,#1060b0,#083080)"
                        : p.tier === "gold" ? "linear-gradient(145deg,#907020,#604010)"
                        : "linear-gradient(145deg,#0f9050,#0b6c3b)",
                      display: "grid",
                      placeItems: "center",
                      fontFamily: "'Saira Condensed'",
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#fff",
                      flex: "0 0 28px",
                    }}
                  >
                    {p.rating}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{p.pos}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {saved && (
        <div className="g-toast success">
          <div className="g-toast-icon">✓</div>
          <span>Escalação salva com sucesso!</span>
        </div>
      )}
    </GameFrame>
  );
}

/* =========================================================================
   LIVE MATCH SCREEN — 3D PITCH + SSE ENGINE
   ========================================================================= */
export function LiveMatchScreen() {
  const [tick, setTick] = useState<MatchTick | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([
    { minute: 0, type: "system", text: "Conectando ao motor de jogo..." },
  ]);
  const [tactic, setTactic] = useState<Tactic>("bal");
  const [showGoal, setShowGoal] = useState(false);
  const [connStatus, setConnStatus] = useState<"connecting" | "live" | "demo">("connecting");
  const eventsRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  const connectSSE = useCallback((t: Tactic) => {
    if (esRef.current) esRef.current.close();
    setConnStatus("connecting");

    const es = new EventSource(`/api/match/stream?tactic=${t}`);
    esRef.current = es;

    es.onopen = () => setConnStatus("live");

    es.onmessage = (e) => {
      try {
        const data: MatchTick = JSON.parse(e.data);
        setTick(data);
        setConnStatus("live");

        if (data.events && data.events.length > 0) {
          setEvents((prev) => [...data.events, ...prev].slice(0, 40));
        }

        if (data.scoreDelta?.home || data.scoreDelta?.away) {
          setShowGoal(true);
          setTimeout(() => setShowGoal(false), 2500);
        }

        if (data.status === "finished") {
          es.close();
          setConnStatus("demo");
        }
      } catch {}
    };

    es.onerror = () => {
      setConnStatus("demo");
      // Fallback: local simulation
      runLocalSim(t);
    };
  }, []);

  function runLocalSim(t: Tactic) {
    let min = tick?.minute ?? 1;
    let homeScore = tick?.homeScore ?? 0;
    let awayScore = tick?.awayScore ?? 0;
    let bx = 50;
    let by = 50;

    const interval = setInterval(() => {
      min++;
      if (min > 90) {
        clearInterval(interval);
        return;
      }

      const tacticBias = t === "atk" ? -15 : t === "def" ? 15 : 0;
      bx = Math.max(5, Math.min(95, bx + (Math.random() - 0.5) * 22));
      by = Math.max(5, Math.min(95, by + (Math.random() - 0.5) * 18 + tacticBias * 0.4));
      const hp = Math.max(20, Math.min(80, 50 + (t === "atk" ? 18 : t === "def" ? -12 : 0) + (Math.random() - 0.5) * 20));

      let eventText = "Bola em jogo...";
      let scored = { home: 0, away: 0 };

      if (by < 20 && Math.random() > 0.82) {
        homeScore++;
        scored.home = 1;
        eventText = `GOOOL! FC Aurora marca! ${homeScore} x ${awayScore}`;
        bx = 50; by = 50;
        setShowGoal(true);
        setTimeout(() => setShowGoal(false), 2500);
      } else if (by > 80 && Math.random() > 0.85) {
        awayScore++;
        scored.away = 1;
        eventText = `GOOOL! Rio Bulls marca! ${homeScore} x ${awayScore}`;
        bx = 50; by = 50;
        setShowGoal(true);
        setTimeout(() => setShowGoal(false), 2500);
      } else if (by < 25) {
        eventText = "Pressão! FC Aurora avança em direção ao gol!";
      } else if (by > 75) {
        eventText = "Rio Bulls bate na trave! Goleiro em alerta!";
      } else {
        eventText = ["Bola em jogo...","Disputa no meio campo.","Ritmo alto de jogo!"][Math.floor(Math.random()*3)];
      }

      const syntheticTick: MatchTick = {
        type: "tick",
        minute: min,
        homeScore,
        awayScore,
        homePower: hp,
        awayPower: 100 - hp,
        ballX: bx,
        ballY: by,
        status: min < 90 ? "live" : "finished",
        players: generateLocalPlayers(t, bx, by),
        events: [{ minute: min, type: scored.home || scored.away ? "goal" : "neutral", text: eventText }],
        scoreDelta: scored.home || scored.away ? scored : undefined,
      };

      setTick(syntheticTick);
      setEvents((prev) => [{ minute: min, type: syntheticTick.events[0].type, text: eventText }, ...prev].slice(0, 40));
    }, 2000);
  }

  function generateLocalPlayers(t: Tactic, bx: number, by: number): MatchPlayer[] {
    const homeBase = [
      [50,92],[20,72],[37,72],[63,72],[80,72],
      [20,52],[37,52],[63,52],[80,52],
      [35,28],[65,28],
    ];
    const awayBase = [
      [50,8],[20,28],[37,28],[63,28],[80,28],
      [20,48],[37,48],[63,48],[80,48],
      [35,72],[65,72],
    ];
    const homeNames = ["E.Vidal","A.Telles","R.Nasc","T.Silva","R.Lima","C.Sousa","M.Costa","F.Dias","L.Gomes","L.Andre","V.Neto"];
    const awayNames = ["D.Lopez","M.Ramos","P.Gael","C.Ferro","J.Rios","A.Vega","E.Nunez","R.Paz","S.Cruz","F.Torres","N.Gil"];
    const homePos = ["GOL","LD","ZAG","ZAG","LE","MD","MC","MC","ME","ATA","ATA"];
    const awayPos = ["GOL","LD","ZAG","ZAG","LE","MD","MC","MC","ME","ATA","ATA"];

    const players: MatchPlayer[] = [];
    homeBase.forEach(([px, py], i) => {
      const spread = t === "atk" ? -10 : t === "def" ? 10 : 0;
      const dx = (bx - px) * 0.12;
      const dy = (by - py) * 0.12;
      players.push({
        id: `h${i}`,
        x: Math.max(4, Math.min(96, px + dx + (Math.random()-0.5)*8)),
        y: Math.max(4, Math.min(96, py + dy + spread + (Math.random()-0.5)*6)),
        team: "home",
        pos: homePos[i],
        name: homeNames[i],
      });
    });
    awayBase.forEach(([px, py], i) => {
      const dx = (bx - px) * 0.08;
      const dy = (by - py) * 0.08;
      players.push({
        id: `a${i}`,
        x: Math.max(4, Math.min(96, px + dx + (Math.random()-0.5)*8)),
        y: Math.max(4, Math.min(96, py + dy + (Math.random()-0.5)*6)),
        team: "away",
        pos: awayPos[i],
        name: awayNames[i],
      });
    });
    return players;
  }

  useEffect(() => {
    connectSSE(tactic);
    return () => { esRef.current?.close(); };
  }, []);

  function changeTactic(t: Tactic) {
    setTactic(t);
    connectSSE(t);
  }

  // Scroll events to top
  useEffect(() => {
    if (eventsRef.current) eventsRef.current.scrollTop = 0;
  }, [events.length]);

  const minute = tick?.minute ?? 0;
  const homeScore = tick?.homeScore ?? 0;
  const awayScore = tick?.awayScore ?? 0;
  const homePower = tick?.homePower ?? 50;
  const ballX = tick?.ballX ?? 50;
  const ballY = tick?.ballY ?? 50;
  const players = tick?.players ?? [];
  const status = tick?.status ?? "live";

  return (
    <GameFrame title="Partida ao Vivo" kicker="RODADA 18 · MOTOR EM TEMPO REAL">
      {/* Goal celebration overlay */}
      {showGoal && (
        <div className="goal-overlay" aria-live="assertive" aria-label="Gol!">
          <div className="goal-text">GOOOOL!</div>
        </div>
      )}

      {/* Connection status */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 10 }}>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            background: connStatus === "live" ? "var(--green-fill)" : "var(--gold-bg)",
            color: connStatus === "live" ? "var(--green-primary)" : "var(--gold)",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: connStatus === "live" ? "var(--green-primary)" : "var(--gold)",
              animation: "pulse-dot 1s infinite",
              display: "inline-block",
            }}
          />
          {connStatus === "live" ? "MOTOR AO VIVO" : connStatus === "connecting" ? "CONECTANDO..." : "MODO DEMO"}
        </span>
        {connStatus !== "live" && (
          <span style={{ color: "var(--text-dim)" }}>Simulação local · identificada como demo</span>
        )}
      </div>

      {/* HUD Placar */}
      <div className="match-hud">
        <div className="hud-team">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="hud-crest">FC</div>
            <div>
              <div className="hud-team-name">FC Aurora</div>
              <div className="hud-team-sub">MANDANTE</div>
            </div>
          </div>
        </div>

        <div className="hud-center">
          <div className="hud-score">
            <span>{homeScore}</span>
            <span className="hud-score-sep">–</span>
            <span>{awayScore}</span>
          </div>
          <div className="hud-minute">
            {status === "halftime" ? "INTERVALO" : status === "finished" ? "FIM" : `${minute}'`}
          </div>
          <div className="hud-status-text">
            {status === "live" ? "TEMPO REAL" : status === "halftime" ? "DESCANSO" : "ENCERRADO"}
          </div>
        </div>

        <div className="hud-team" style={{ alignItems: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: "row-reverse" }}>
            <div className="hud-crest away">RB</div>
            <div style={{ textAlign: "right" }}>
              <div className="hud-team-name">Rio Bulls</div>
              <div className="hud-team-sub">VISITANTE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Power bar */}
      <div className="power-bar-wrapper">
        <div className="power-bar-header">
          <div>
            <div className="eyebrow" style={{ marginBottom: 2 }}>Domínio de Jogo</div>
            <div className="power-bar-pct">{homePower.toFixed(0)}%</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="eyebrow" style={{ marginBottom: 2 }}>Rio Bulls</div>
            <div className="power-bar-pct away">{(100 - homePower).toFixed(0)}%</div>
          </div>
        </div>
        <div className="power-bar-track">
          <div className="power-bar-fill" style={{ width: `${homePower}%` }} />
        </div>
        <div className="power-bar-labels">
          <span className="home-label">◉ FC Aurora dominando</span>
          <span className="away-label">Rio Bulls pressiona ◉</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>
        {/* LEFT: 3D PITCH */}
        <div>
          <div className="g-panel" style={{ padding: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <h3 style={{ fontSize: 13, fontWeight: 800 }}>Campo ao Vivo</h3>
              <span style={{ fontSize: 9, color: "var(--text-muted)" }}>
                22 jogadores em tempo real
              </span>
            </div>

            {/* 3D Pitch container */}
            <div
              className="live-pitch-surface"
              style={{ position: "relative", paddingBottom: "62%", userSelect: "none" }}
            >
              {/* Pitch lines */}
              <div className="live-pitch-lines" />
              <div className="live-pitch-center-circle" />
              <div className="live-pitch-goal-top" />
              <div className="live-pitch-goal-bottom" />

              {/* Goal posts */}
              <div
                style={{
                  position: "absolute",
                  left: "38%",
                  right: "38%",
                  top: 10,
                  height: 8,
                  background: "rgba(255,255,255,.9)",
                  boxShadow: "0 0 8px rgba(255,255,255,.5)",
                  zIndex: 4,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "38%",
                  right: "38%",
                  bottom: 10,
                  height: 8,
                  background: "rgba(255,255,255,.9)",
                  boxShadow: "0 0 8px rgba(255,255,255,.5)",
                  zIndex: 4,
                }}
              />

              {/* Ball */}
              <div
                className="live-ball"
                style={{
                  left: `${ballX}%`,
                  top: `${ballY}%`,
                }}
              />

              {/* Players */}
              {players.map((p) => (
                <div
                  key={p.id}
                  className={`live-player ${p.team}`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  title={`${p.name} (${p.pos})`}
                >
                  <div className="live-player-dot">
                    <span style={{ fontSize: 7, fontWeight: 900 }}>{p.pos[0]}</span>
                  </div>
                  <div className="live-player-name">{p.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tactics */}
          <div className="g-panel" style={{ marginTop: 12 }}>
            <div className="panel-title">
              <h3 style={{ fontSize: 13 }}>Tática em Tempo Real</h3>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Mudança afeta o jogo imediatamente</span>
            </div>
            <div className="tactics-grid">
              <button
                className={`tactic-btn ${tactic === "atk" ? "active attack" : ""}`}
                onClick={() => changeTactic("atk")}
                aria-pressed={tactic === "atk"}
              >
                <div className="tactic-btn-icon">⚡</div>
                <strong>Todo Ataque</strong>
                <small>Pressão máxima, risco alto</small>
              </button>
              <button
                className={`tactic-btn ${tactic === "bal" ? "active" : ""}`}
                onClick={() => changeTactic("bal")}
                aria-pressed={tactic === "bal"}
              >
                <div className="tactic-btn-icon">⚖</div>
                <strong>Equilibrado</strong>
                <small>Construção ponderada</small>
              </button>
              <button
                className={`tactic-btn ${tactic === "def" ? "active defend" : ""}`}
                onClick={() => changeTactic("def")}
                aria-pressed={tactic === "def"}
              >
                <div className="tactic-btn-icon">🛡</div>
                <strong>Retranca</strong>
                <small>Segurança máxima, contra-ataque</small>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Events */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Narrator */}
          <div className="event-ticker">
            <div className="ticker-header">
              <div className="ticker-live-dot" />
              NARRAÇÃO AO VIVO
            </div>
            <div className="ticker-events" ref={eventsRef}>
              {events.map((ev, i) => (
                <div
                  key={i}
                  className={`ticker-event ${ev.type === "goal" ? "goal" : ""}`}
                >
                  <div className="ticker-minute">{ev.minute}&apos;</div>
                  <div className="ticker-text">{ev.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini lineup */}
          <div className="g-panel">
            <div className="panel-title" style={{ marginBottom: 10 }}>
              <h3 style={{ fontSize: 12 }}>Escalação FC Aurora</h3>
            </div>
            {SQUAD_PLAYERS.slice(0, 6).map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 0",
                  borderBottom: "1px solid var(--green-line)",
                  fontSize: 11,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background:
                      p.tier === "extreme" ? "linear-gradient(145deg,#c03020,#881808)"
                      : p.tier === "diamond" ? "linear-gradient(145deg,#1060b0,#083080)"
                      : "linear-gradient(145deg,#0f9050,#0b6c3b)",
                    display: "grid",
                    placeItems: "center",
                    fontFamily: "'Saira Condensed'",
                    fontSize: 10,
                    fontWeight: 900,
                    color: "#fff",
                    flex: "0 0 22px",
                  }}
                >
                  {p.rating}
                </div>
                <span style={{ flex: 1, color: "var(--text-secondary)" }}>{p.name}</span>
                <span style={{ color: "var(--text-dim)", fontSize: 9 }}>{p.pos}</span>
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <Link href="/lineup" className="btn-ghost" style={{ fontSize: 10 }}>
                Ver escalação completa →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </GameFrame>
  );
}

/* =========================================================================
   STORE SCREEN
   ========================================================================= */
export function StoreScreen() {
  const { catalog } = useCatalog();
  const [tab, setTab] = useState("coins");
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const coinPacks = [
    { id: "starter", label: "Starter", coins: 3000, bonus: "", price: "R$ 14,90", featured: false },
    { id: "popular", label: "Mais Popular", coins: 10000, bonus: "+2.000 BÔNUS", price: "R$ 39,90", featured: true },
    { id: "pro", label: "Pro Manager", coins: 25000, bonus: "+8.000 BÔNUS", price: "R$ 89,90", featured: false },
    { id: "elite", label: "Elite", coins: 60000, bonus: "+25.000 BÔNUS", price: "R$ 179,90", featured: false },
    { id: "legend", label: "Lendário", coins: 150000, bonus: "+80.000 BÔNUS", price: "R$ 399,90", featured: false },
    { id: "boss", label: "BOSS", coins: 500000, bonus: "+300.000 BÔNUS", price: "R$ 999,90", featured: false },
  ];

  const players = catalog.players.length > 0 ? catalog.players : [
    { id: 1, name: "L. Andrade", position: "ATA", rating: 92, tag: "EXTREMO", price: "12.400", team: "FC Aurora", color: "coral" },
    { id: 2, name: "M. Costa", position: "MEI", rating: 88, tag: "DIAMANTE", price: "7.800", team: "Santos FC", color: "diamond" },
    { id: 3, name: "R. Nascimento", position: "ZAG", rating: 84, tag: "OURO", price: "5.200", team: "Flamengo", color: "gold" },
    { id: 4, name: "E. Vidal", position: "GOL", rating: 81, tag: "PRATA", price: "3.950", team: "Grêmio", color: "silver" },
  ];

  const items = catalog.items.length > 0 ? catalog.items : [
    { name: "Chuteira Fênix", slot: "Chuteira", power: "Fogo", bonus: 8, rarity: "Extremo" },
    { name: "Luva Maré Alta", slot: "Luva", power: "Água", bonus: 7, rarity: "Diamante" },
    { name: "Colar Voltagem", slot: "Colar", power: "Raio", bonus: 6, rarity: "Ouro" },
    { name: "Touca Ventus", slot: "Touca", power: "Vento", bonus: 5, rarity: "Ouro" },
    { name: "Máscara Glacial", slot: "Máscara", power: "Gelo", bonus: 9, rarity: "Extremo" },
  ];

  return (
    <GameFrame title="Loja" kicker="FC MANAGER STORE">
      <div>
        {/* Store tabs */}
        <div className="store-tabs">
          {[
            { id: "coins", label: "◈ FC Coins" },
            { id: "players", label: "⭐ Jogadores Especiais" },
            { id: "items", label: "⚡ Arsenal Elemental" },
          ].map((t) => (
            <button
              key={t.id}
              className={`store-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* FC Coins */}
        {tab === "coins" && (
          <div>
            <div
              style={{
                padding: "20px 24px",
                marginBottom: 20,
                borderRadius: "var(--radius-lg)",
                background: "linear-gradient(110deg, rgba(63,201,116,.1), rgba(245,200,66,.06))",
                border: "1px solid var(--green-line)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Seu saldo atual</div>
                <div
                  style={{
                    fontFamily: "'Saira Condensed'",
                    fontSize: 36,
                    fontWeight: 900,
                    color: "var(--gold)",
                    letterSpacing: "-.04em",
                  }}
                >
                  ◈ 24.850 <span style={{ fontSize: 16, color: "var(--text-muted)" }}>FC</span>
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  textAlign: "right",
                  maxWidth: 260,
                  lineHeight: 1.5,
                }}
              >
                Pagamento via PIX. Saldo creditado após confirmação do banco.
                <br />
                <span style={{ color: "var(--green-primary)" }}>🔒 Ambiente seguro</span>
              </div>
            </div>
            <div className="coin-packs-grid">
              {coinPacks.map((pack) => (
                <div key={pack.id} className={`coin-pack ${pack.featured ? "featured" : ""}`}>
                  {pack.featured && <div className="pack-badge">⭐ MAIS POPULAR</div>}
                  {pack.id === "boss" && <div className="pack-badge hot">🔥 BOSS</div>}
                  <div className="coin-icon-big">◈</div>
                  <div className="pack-amount">{pack.coins.toLocaleString("pt-BR")}</div>
                  {pack.bonus && <div className="pack-bonus">{pack.bonus}</div>}
                  <div className="pack-price">
                    <small>via PIX</small>
                    {pack.price}
                  </div>
                  <button
                    className={pack.featured ? "btn-primary" : "btn-secondary"}
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => showToast(`Gerando PIX para ${pack.label}... Aguarde confirmação do banco.`)}
                  >
                    Comprar agora
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Players */}
        {tab === "players" && (
          <div>
            <div className="cards-grid">
              {players.map((p) => {
                const tier =
                  p.tag?.toLowerCase().includes("extremo") ? "extreme"
                  : p.tag?.toLowerCase().includes("diamante") ? "diamond"
                  : p.tag?.toLowerCase().includes("ouro") ? "gold"
                  : "silver";
                return (
                  <div
                    key={p.id ?? p.name}
                    className={`holo-card tier-${tier}`}
                    onClick={() => showToast(`${p.name} contratado! ✓ -${p.price} FC`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && showToast(`${p.name} contratado!`)}
                    aria-label={`Contratar ${p.name} por ${p.price} FC`}
                  >
                    <div className={`card-tier-badge badge-${tier}`}>{p.tag ?? tier.toUpperCase()}</div>
                    <div className="card-avatar-wrap" style={{ background: "transparent", border: "none", boxShadow: "none" }}>
                      <img src={p.tag?.toLowerCase().includes("extremo") || p.tag?.toLowerCase().includes("diamante") ? "/assets/mini-craque-star.png" : "/assets/mini-craque-home.png"} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div className="card-rating">{p.rating}</div>
                    <div className="card-position">{p.position}</div>
                    <div className="card-name">{p.name}</div>
                    <div className="card-team">{p.team}</div>
                    <div className="card-price">
                      <span className="price-icon">◈</span>
                      {p.price} FC
                    </div>
                    <button
                      className="btn-primary"
                      style={{ width: "100%", marginTop: 10, justifyContent: "center", fontSize: 10 }}
                      onClick={async (e) => { 
                        e.stopPropagation(); 
                        showToast(`Processando...`);
                        try {
                          const res = await fetch('/api/store/buy', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ item_name: p.name, item_type: 'player', price: p.price })
                          });
                          if(res.ok) showToast(`${p.name} contratado! ✓`);
                        } catch(err) {
                          showToast(`Erro ao contratar ${p.name}`);
                        }
                      }}
                    >
                      Contratar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        {tab === "items" && (
          <div>
            <div
              style={{
                marginBottom: 20,
                padding: "16px 20px",
                background: "var(--bg-panel)",
                border: "1px solid var(--green-line)",
                borderRadius: "var(--radius-lg)",
                fontSize: 12,
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}
            >
              ⚡ <strong style={{ color: "var(--text-primary)" }}>Arsenal Elemental</strong> — Equipe seus
              jogadores com itens poderosos e booste seus atributos em campo. Cada item possui um elemento
              (Fogo, Água, Raio, Vento, Gelo) que ativa bônus especiais durante a partida.
            </div>
            <div className="cards-grid">
              {items.map((item) => {
                const elColors: Record<string, string> = {
                  Fogo: "#ff6b4a", Água: "#4a9eff", Raio: "#f5c842", Vento: "#3fc974", Gelo: "#a0d8ff",
                };
                const elIcons: Record<string, string> = {
                  Fogo: "🔥", Água: "💧", Raio: "⚡", Vento: "🌪", Gelo: "❄️",
                };
                const tier =
                  item.rarity === "Extremo" ? "extreme"
                  : item.rarity === "Diamante" ? "diamond"
                  : "gold";

                return (
                  <div key={item.name} className={`holo-card tier-${tier}`} tabIndex={0} role="button">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{elIcons[item.power] ?? "🎮"}</span>
                      <div className={`card-tier-badge badge-${tier}`}>{item.rarity}</div>
                    </div>
                    <div className="card-name">{item.name}</div>
                    <div style={{ fontSize: 10, color: elColors[item.power] ?? "var(--green-primary)", marginTop: 4 }}>
                      {item.power} · {item.slot}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Saira Condensed'",
                        fontSize: 28,
                        fontWeight: 900,
                        color: "var(--green-primary)",
                        margin: "8px 0",
                      }}
                    >
                      +{item.bonus}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", marginBottom: 10 }}>
                      Bônus de {item.power}
                    </div>
                    <button
                      className="btn-secondary"
                      style={{ width: "100%", justifyContent: "center", fontSize: 10 }}
                      onClick={() => showToast(`${item.name} equipado com sucesso!`)}
                    >
                      Equipar Item
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="g-toast success" role="alert" aria-live="polite">
          <div className="g-toast-icon">✓</div>
          <span>{toast}</span>
        </div>
      )}
    </GameFrame>
  );
}

/* =========================================================================
   TRANSFER LIST SCREEN
   ========================================================================= */
export function TransferListScreen() {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const transferPlayers = [
    { id: 1, name: "L. Andrade", pos: "ATA", rating: 92, tier: "extreme", club: "FC Aurora", country: "BR", price: "12.400", goals: 14 },
    { id: 2, name: "M. Costa", pos: "MEI", rating: 88, tier: "diamond", club: "Santos FC", country: "BR", price: "7.800", goals: 8 },
    { id: 3, name: "R. Nascimento", pos: "ZAG", rating: 84, tier: "gold", club: "Flamengo", country: "BR", price: "5.200", goals: 2 },
    { id: 4, name: "E. Vidal", pos: "GOL", rating: 81, tier: "silver", club: "Grêmio", country: "BR", price: "3.950", goals: 0 },
    { id: 5, name: "P. Torres", pos: "ATA", rating: 87, tier: "diamond", club: "River Plate", country: "AR", price: "9.100", goals: 19 },
    { id: 6, name: "C. Romero", pos: "MD", rating: 82, tier: "gold", club: "Boca Juniors", country: "AR", price: "4.600", goals: 5 },
    { id: 7, name: "F. Silva", pos: "ZAG", rating: 80, tier: "silver", club: "Porto Legends", country: "PT", price: "3.200", goals: 1 },
    { id: 8, name: "A. Ramos", pos: "LD", rating: 79, tier: "silver", club: "Bahia United", country: "BR", price: "2.800", goals: 3 },
  ];

  const positions = ["Todos", "GOL", "ZAG", "LD", "LE", "MD", "MC", "ME", "ATA"];

  const filtered = transferPlayers.filter((p) => {
    const matchPos = filter === "Todos" || p.pos === filter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.club.toLowerCase().includes(search.toLowerCase());
    return matchPos && matchSearch;
  });

  return (
    <GameFrame title="Mercado de Transferências" kicker="JANELA DE TRANSFERÊNCIAS ABERTA">
      <div>
        {/* Filter bar */}
        <div className="filter-bar">
          <div className="search-field">
            <span>🔍</span>
            <input
              type="search"
              placeholder="Buscar jogador ou clube..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar jogador"
            />
          </div>
          {positions.map((pos) => (
            <button
              key={pos}
              className={`filter-pill ${filter === pos ? "active" : ""}`}
              onClick={() => setFilter(pos)}
            >
              {pos}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 10, fontSize: 11, color: "var(--text-muted)" }}>
          {filtered.length} jogador{filtered.length !== 1 ? "es" : ""} disponível{filtered.length !== 1 ? "is" : ""}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((p) => (
            <div key={p.id} className="transfer-card">
              {/* Avatar */}
              <div
                className="transfer-avatar"
                style={{
                  background:
                    p.tier === "extreme" ? "linear-gradient(145deg,#c03020,#881808)"
                    : p.tier === "diamond" ? "linear-gradient(145deg,#1060b0,#083080)"
                    : p.tier === "gold" ? "linear-gradient(145deg,#907020,#604010)"
                    : "linear-gradient(145deg,#3a4a3e,#252f28)",
                  color: "rgba(255,255,255,.6)",
                  fontSize: 14,
                  fontWeight: 900,
                  fontFamily: "'Saira Condensed'",
                }}
              >
                {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>

              <div className="transfer-info">
                <div className="transfer-name">{p.name}</div>
                <div className="transfer-meta">
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: ".08em",
                      marginRight: 6,
                      background:
                        p.tier === "extreme" ? "var(--coral-bg)"
                        : p.tier === "diamond" ? "var(--blue-bg)"
                        : "var(--gold-bg)",
                      color:
                        p.tier === "extreme" ? "var(--coral)"
                        : p.tier === "diamond" ? "var(--blue)"
                        : "var(--gold)",
                    }}
                  >
                    {p.pos}
                  </span>
                  {p.club} · {p.goals} gol{p.goals !== 1 ? "s" : ""}
                </div>
              </div>

              <div className="transfer-rating">{p.rating}</div>

              <div className="transfer-price">
                ◈ {p.price} FC
              </div>

              <button
                className="btn-primary"
                style={{ fontSize: 10, padding: "8px 14px" }}
                onClick={() => showToast(`Proposta enviada para ${p.name}!`)}
              >
                Contratar
              </button>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className="g-toast success" role="alert">
          <div className="g-toast-icon">✓</div>
          <span>{toast}</span>
        </div>
      )}
    </GameFrame>
  );
}

/* =========================================================================
   STADIUM SCREEN
   ========================================================================= */
export function StadiumScreen() {
  const { catalog } = useCatalog();
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const stadium = catalog.stadiums?.[0] ?? {
    name: "Estádio Aurora",
    capacity: "42.500",
    level: "24",
    upgrades: [
      { name: "Arquibancada Norte", level: "Nível 06", value: "18.000", progress: 82, icon: "🏟", tone: "mint" },
      { name: "Iluminação LED", level: "Nível 04", value: "8.500", progress: 60, icon: "💡", tone: "gold" },
      { name: "Vestiário VIP", level: "Nível 03", value: "12.000", progress: 45, icon: "⭐", tone: "coral" },
      { name: "Gramado Sintético", level: "Nível 07", value: "5.000", progress: 91, icon: "🌿", tone: "mint" },
    ],
  };

  return (
    <GameFrame title="Estádio" kicker="INFRAESTRUTURA DO CLUBE">
      <div>
        {/* Stadium hero */}
        <div className="stadium-hero">
          <div className="stadium-info">
            <div className="eyebrow" style={{ marginBottom: 6 }}>Seu Estádio</div>
            <h2>{stadium.name}</h2>
            <div className="capacity">
              Capacidade: <b>{stadium.capacity}</b> lugares
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
              <button className="btn-primary" onClick={() => showToast("Expansão iniciada! Previsão: 7 dias.")}>
                🏗 Expandir Estádio
              </button>
              <button className="btn-secondary" onClick={() => showToast("Manutenção agendada.")}>
                Manutenção
              </button>
            </div>
          </div>

          <div className="stadium-level">
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 35% 35%, rgba(63,201,116,.2), transparent), linear-gradient(145deg, rgba(15,34,19,.9), rgba(10,26,14,.95))",
                border: "3px solid rgba(63,201,116,.3)",
                boxShadow: "0 0 40px rgba(63,201,116,.15), 0 20px 50px rgba(0,0,0,.4)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <div className="level-num">{stadium.level}</div>
              <small style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: ".1em" }}>NÍVEL</small>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-label">Receita por Jogo</div>
            <div className="stat-big">8.500</div>
            <div className="stat-sub">FC por partida em casa</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-label">Público Médio</div>
            <div className="stat-big">38.400</div>
            <div className="stat-sub positive">91% de ocupação</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon gold">⭐</div>
            <div className="stat-label">Ranking Estádio</div>
            <div className="stat-big">7°</div>
            <div className="stat-sub">Entre todos managers</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon coral">⬆</div>
            <div className="stat-label">Próximo Nível</div>
            <div className="stat-big">25</div>
            <div className="stat-sub">+3.200 FC necessários</div>
          </div>
        </div>

        {/* Upgrades */}
        <div className="g-panel">
          <div className="panel-title">
            <h2>Melhorias Disponíveis</h2>
          </div>
          <div className="upgrade-list">
            {stadium.upgrades.map((u, i) => (
              <div key={i} className="upgrade-item">
                <div className="upgrade-icon">{u.icon}</div>
                <div className="upgrade-info">
                  <div className="upgrade-name">{u.name}</div>
                  <div className="upgrade-level">{u.level}</div>
                  <div className="upgrade-progress-bar">
                    <div
                      className="upgrade-progress-fill"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green-primary)", marginBottom: 6 }}>
                    ◈ {u.value} FC
                  </div>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: 10, padding: "6px 12px" }}
                    onClick={() => showToast(`Upgrade de ${u.name} iniciado!`)}
                  >
                    Melhorar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {toast && (
        <div className="g-toast success" role="alert">
          <div className="g-toast-icon">✓</div>
          <span>{toast}</span>
        </div>
      )}
    </GameFrame>
  );
}

/* =========================================================================
   STANDINGS SCREEN
   ========================================================================= */
export function StandingsScreen() {
  const { catalog } = useCatalog();

  const leaderboard = [
    { rank: 1, name: "ElMister_BR", club: "São Paulo Kings", wins: 14, pts: 44, movement: "→" },
    { rank: 2, name: "PortoFC_PT", club: "Porto Legends", wins: 13, pts: 41, movement: "↑" },
    { rank: 3, name: "Você", club: "FC Aurora", wins: 11, pts: 36, movement: "↑", isYou: true },
    { rank: 4, name: "MisterGol_AR", club: "River Stars", wins: 10, pts: 33, movement: "↓" },
    { rank: 5, name: "TacticPro_ES", club: "Madrid Elite", wins: 10, pts: 32, movement: "↓" },
    { rank: 6, name: "KingManager", club: "Bahia United", wins: 9, pts: 29, movement: "↑" },
    { rank: 7, name: "FutMaster77", club: "Mineiro Club", wins: 9, pts: 28, movement: "→" },
    { rank: 8, name: "ChampionFC", club: "Rio Bulls", wins: 8, pts: 25, movement: "↓" },
  ];

  return (
    <GameFrame title="Ranking Global" kicker="TEMPORADA ATUAL">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div>
          {/* Hero */}
          <div
            style={{
              padding: "28px 32px",
              marginBottom: 16,
              borderRadius: "var(--radius-xl)",
              background:
                "radial-gradient(circle at 80% 40%, rgba(245,200,66,.15), transparent 30%), linear-gradient(115deg, #181830, #12182a)",
              border: "1px solid rgba(176,106,255,.2)",
            }}
          >
            <div className="eyebrow">Sua posição global</div>
            <div style={{ fontFamily: "'Saira Condensed'", fontSize: 64, fontWeight: 900, color: "var(--gold)", lineHeight: 1, margin: "8px 0 4px" }}>
              3°
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
              De {catalog.onlineManagers.toLocaleString("pt-BR")} managers ativos
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green-primary)" }}>
                ▲ +2 posições esta semana
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="g-panel" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--green-line)", display: "flex", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 15, fontWeight: 800 }}>Tabela de Líderes</h2>
              <span style={{ fontSize: 10, color: "var(--green-primary)", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green-primary)", display: "inline-block" }} />
                {catalog.onlineManagers} online
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "36px 40px 1fr 80px 80px",
                gap: 12,
                padding: "10px 20px",
                borderBottom: "1px solid var(--green-line)",
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: ".1em",
                color: "var(--text-dim)",
                textTransform: "uppercase",
              }}
            >
              <span>POS</span>
              <span></span>
              <span>MANAGER</span>
              <span style={{ textAlign: "right" }}>VITÓRIAS</span>
              <span style={{ textAlign: "right" }}>PTS</span>
            </div>
            <div className="leaderboard">
              {leaderboard.map((row) => (
                <div
                  key={row.rank}
                  className={`leaderboard-row ${row.isYou ? "is-you" : ""}`}
                >
                  <div className={`lb-rank ${row.rank === 1 ? "top1" : row.rank === 2 ? "top2" : row.rank === 3 ? "top3" : ""}`}>
                    {row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : row.rank}
                  </div>
                  <div
                    className="lb-ava"
                    style={{
                      background: row.isYou
                        ? "linear-gradient(145deg, var(--gold), #c08020)"
                        : undefined,
                      color: row.isYou ? "#201000" : undefined,
                    }}
                  >
                    {row.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="lb-name">
                      {row.name}
                      {row.isYou && (
                        <span style={{ fontSize: 8, marginLeft: 6, color: "var(--green-primary)", background: "var(--green-fill)", padding: "2px 5px", borderRadius: 4 }}>
                          VOCÊ
                        </span>
                      )}
                    </div>
                    <div className="lb-club">{row.club}</div>
                  </div>
                  <div className="lb-wins">{row.wins}V</div>
                  <div className="lb-pts">{row.pts}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="g-panel">
            <div className="panel-title">
              <h2>Sua Temporada</h2>
            </div>
            {[
              { label: "Vitórias", value: "11", color: "var(--green-primary)" },
              { label: "Empates", value: "3", color: "var(--gold)" },
              { label: "Derrotas", value: "4", color: "var(--coral)" },
              { label: "Gols Marcados", value: "34", color: "var(--blue)" },
              { label: "Gols Sofridos", value: "18", color: "var(--text-muted)" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--green-line)",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>{stat.label}</span>
                <strong style={{ fontFamily: "'Saira Condensed'", fontSize: 20, fontWeight: 900, color: stat.color }}>
                  {stat.value}
                </strong>
              </div>
            ))}
          </div>

          <div className="g-panel">
            <div className="panel-title">
              <h2>Troféus</h2>
            </div>
            {(catalog.trophies.length > 0 ? catalog.trophies : [
              { name: "Copa Aurora", season: "Temporada 06", icon: "🏆", tone: "gold" },
              { name: "Liga dos Managers", season: "Temporada 05", icon: "🥇", tone: "diamond" },
            ]).map((t, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 0",
                  borderBottom: "1px solid var(--green-line)",
                  fontSize: 12,
                }}
              >
                <span style={{ fontSize: 22 }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{t.name}</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)" }}>{t.season}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GameFrame>
  );
}

/* =========================================================================
   ADMIN SCREEN
   ========================================================================= */
export function AdminScreen() {
  const [tab, setTab] = useState("overview");
  const [livePurchases, setLivePurchases] = useState<any[]>([]);

  useEffect(() => {
    const es = new EventSource('/api/admin/stream');
    es.onmessage = (e) => {
      const payload = JSON.parse(e.data);
      if (payload.type === 'new_purchases') {
        setLivePurchases(prev => [...payload.data, ...prev]);
      }
    };
    return () => es.close();
  }, []);

  const mockStats = {
    users: 1847,
    active_users: 342,
    pending_orders: livePurchases.length,
    players: 2400,
  };

  return (
    <GameFrame title="Painel Admin" kicker="ADMINISTRAÇÃO DO SISTEMA">
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["overview", "orders", "health"].map((t) => (
              <button
                key={t}
                className={tab === t ? "btn-primary" : "btn-secondary"}
                onClick={() => setTab(t)}
              >
                {t === "overview" ? "📊 Overview" : t === "orders" ? "💳 Pedidos" : "🩺 Saúde"}
              </button>
            ))}
          </div>
          <button 
            className="btn-primary" 
            style={{ background: "var(--gold)", color: "#000" }}
            onClick={async (e) => {
              const btn = e.currentTarget;
              btn.innerText = "Sincronizando...";
              try {
                const r = await fetch('/api/sync/football', { method: 'POST' });
                const data = await r.json();
                alert(data.message);
              } catch(e) {
                alert("Erro ao sincronizar");
              } finally {
                btn.innerText = "⚽ Sincronizar API";
              }
            }}
          >
            ⚽ Sincronizar API
          </button>
        </div>

        {tab === "overview" && (
          <div>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-label">Total de Usuários</div>
                <div className="stat-big">{mockStats.users.toLocaleString("pt-BR")}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue">🟢</div>
                <div className="stat-label">Ativos Agora</div>
                <div className="stat-big">{mockStats.active_users}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon coral">⏳</div>
                <div className="stat-label">Pedidos Pendentes</div>
                <div className="stat-big">{mockStats.pending_orders}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon gold">⭐</div>
                <div className="stat-label">Jogadores no Catálogo</div>
                <div className="stat-big">{mockStats.players.toLocaleString("pt-BR")}</div>
              </div>
            </div>

            <div className="g-panel">
              <div className="panel-title">
                <h2>Log de Sistema</h2>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.8 }}>
                <div>
                  <span style={{ color: "var(--green-primary)" }}>[OK]</span> Frontend Vercel: online
                </div>
                <div>
                  <span style={{ color: "var(--gold)" }}>[WARN]</span> Laravel API: não configurado (ADR 0007)
                </div>
                <div>
                  <span style={{ color: "var(--gold)" }}>[WARN]</span> Supabase: pendente chaves de prod, usando Mock Stream
                </div>
                <div>
                  <span style={{ color: "var(--coral)" }}>[INFO]</span> SSE Match Engine: ativo (modo simulação)
                </div>
                <div>
                  <span style={{ color: "var(--green-primary)" }}>[OK]</span> Catálogo local: 4 jogadores carregados
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "health" && (
          <div className="g-panel">
            <div className="panel-title">
              <h2>Status dos Serviços</h2>
            </div>
            {[
              { name: "Frontend (Vercel)", status: "online" },
              { name: "SSE Match Engine", status: "online" },
              { name: "API Catálogo (local)", status: "online" },
              { name: "Admin Live Stream", status: "online" },
              { name: "Supabase DB", status: "pending" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--green-line)",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>{s.name}</span>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 6,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    background:
                      s.status === "online" ? "var(--green-fill)"
                      : s.status === "offline" ? "var(--coral-bg)"
                      : "var(--gold-bg)",
                    color:
                      s.status === "online" ? "var(--green-primary)"
                      : s.status === "offline" ? "var(--coral)"
                      : "var(--gold)",
                  }}
                >
                  {s.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "orders" && (
          <div className="g-panel" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--green-line)" }}>
              <h2 style={{ fontSize: 15, fontWeight: 800 }}>Pedidos Recentes (Live Stream)</h2>
            </div>
            {livePurchases.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>💳</div>
                <div>Aguardando compras na loja em tempo real...</div>
              </div>
            ) : (
              <div>
                {livePurchases.map((p, i) => (
                  <div key={i} style={{ padding: "12px 20px", borderBottom: "1px solid var(--green-line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: 14 }}>{p.item_name}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{new Date(p.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <div style={{ color: "var(--gold)", fontWeight: "bold" }}>{p.price} FC</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </GameFrame>
  );
}

/* =========================================================================
   SCREEN ALIASES (for backward compat)
   ========================================================================= */
export function ChooseLeagueScreen() {
  return (
    <GameFrame title="Escolher Liga" kicker="CONFIGURAR CLUBE">
      <div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Ligas Disponíveis</div>
        <div className="cards-grid">
          {[
            { name: "Brasil", flag: "🇧🇷", clubs: "20 clubes", color: "#009c3b" },
            { name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", clubs: "20 clubes", color: "#cf142b" },
            { name: "Espanha", flag: "🇪🇸", clubs: "20 clubes", color: "#c60b1e" },
            { name: "Europa Elite", flag: "🌍", clubs: "32 clubes", color: "var(--purple)" },
          ].map((league) => (
            <div
              key={league.name}
              className="g-panel"
              style={{ cursor: "pointer", textAlign: "center" }}
              role="button"
              tabIndex={0}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>{league.flag}</div>
              <div style={{ fontFamily: "'Saira Condensed'", fontSize: 18, fontWeight: 800 }}>{league.name}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>{league.clubs}</div>
              <button className="btn-primary" style={{ marginTop: 14, width: "100%", justifyContent: "center" }}>
                Entrar
              </button>
            </div>
          ))}
        </div>
      </div>
    </GameFrame>
  );
}
