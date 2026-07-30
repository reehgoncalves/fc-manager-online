"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCatalog, type GamePlayer } from "./catalog";

function ApiStatus({ state }: { state: "loading" | "fallback" | "live" }) {
  if (state === "loading") return <span className="api-badge loading"><i /> Conectando motor...</span>;
  if (state === "fallback") return <span className="api-badge fallback"><i /> Modo offline / Demo</span>;
  return <span className="api-badge live"><i /> Sincronizado</span>;
}

export function GameNav() {
  const path = usePathname();
  const nav = [
    ["/career", "⌂", "Carreira"],
    ["/choose-league", "◈", "Ligas"],
    ["/lineup", "♙", "Tática"],
    ["/live-match", "◉", "Partida 2D"],
    ["/store", "✦", "Loja OSM"],
    ["/transfer-list", "↗", "Mercado"],
    ["/stadium", "▦", "Estádio"],
    ["/admin", "⚙", "Admin"],
  ];
  return (
    <nav className="game-sidebar">
      <div className="game-brand">
        <span className="brand-mark">FC</span>
        Manager <b>Online</b>
      </div>
      <div className="game-club">
        <strong>FC Aurora</strong>
        <small>Seu Clube</small>
      </div>
      <div className="game-nav">
        {nav.map(([href, icon, label]) => (
          <Link key={href} href={href} className={path === href ? "active" : ""}>
            <span>{icon}</span> {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function GameTopbar({ title, kicker }: { title: string; kicker: string }) {
  const { catalog } = useCatalog();
  return (
    <header className="game-topbar">
      <div>
        <span className="eyebrow">{kicker}</span>
        <h1>{title}</h1>
      </div>
      <div className="game-top-actions">
        <div className="game-coins">
          ◈ <b>{catalog.wallet?.balance ?? 24850}</b> FC
        </div>
        <button className="primary-game-button" onClick={() => window.location.assign("/store")} type="button">
          + Moedas
        </button>
      </div>
    </header>
  );
}

async function signOutManager() {
  await fetch("/api/auth/logout", { method: "POST", headers: { Accept: "application/json" } }).catch(() => undefined);
  document.cookie = "fc_manager_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  window.localStorage.removeItem("fc-manager-logout-notice");
  window.location.assign("/login");
}

export function GameFrame({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) {
  const [sessionReady, setSessionReady] = useState(false);
  useEffect(() => {
    fetch("/api/auth/me", { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("anonymous");
        setSessionReady(true);
      })
      .catch(() => window.location.assign("/login"));
  }, []);

  if (!sessionReady) return <main style={{ display: "grid", placeItems: "center", height: "100vh", background: "#05140b", color: "#fff" }}><p>Iniciando Motor do Jogo...</p></main>;

  return (
    <main className="game-app">
      <GameNav />
      <div className="game-main">
        <GameTopbar title={title} kicker={kicker} />
        <div className="game-content">{children}</div>
      </div>
    </main>
  );
}

/* =========================================================================
   LIVE MATCH 2D PITCH ENGINE (The real OSM Game Core)
   ========================================================================= */
export function LiveMatchScreen() {
  const [matchData, setMatchData] = useState({ homeScore: 0, awayScore: 0, minute: 1 });
  const [ballPos, setBallPos] = useState({ x: 50, y: 50 }); // percentages
  const [tactic, setTactic] = useState("bal");
  const [events, setEvents] = useState<string[]>(["O árbitro apita o início de jogo!"]);
  
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Motor Gráfico 10x
    tickRef.current = setInterval(() => {
      setMatchData((prev) => {
        if (prev.minute >= 90) {
          if (tickRef.current) clearInterval(tickRef.current);
          setEvents((e) => ["Fim de jogo! O árbitro encerra a partida.", ...e]);
          return prev;
        }
        return { ...prev, minute: prev.minute + 1 };
      });

      // Lógica de Movimentação Dinâmica (Ball and Momentum)
      setBallPos((prev) => {
        const moveX = (Math.random() - 0.5) * 20; // Move ball
        const moveY = (Math.random() - 0.5) * 20;
        let newX = Math.max(5, Math.min(95, prev.x + moveX));
        let newY = Math.max(5, Math.min(95, prev.y + moveY));
        
        // Tactic influence
        if (tactic === "atk") newX = Math.min(95, newX + 15); // Push forward (assuming Aurora attacks right)
        if (tactic === "def") newX = Math.max(5, newX - 15);  // Pull back
        
        // Shoot Event trigger
        if (newX > 85 && Math.random() > 0.8) {
           setMatchData((m) => ({ ...m, homeScore: m.homeScore + 1 }));
           setEvents((e) => ["GOOOOOL! Um chutaço certeiro do FC Aurora!", ...e]);
           newX = 50; newY = 50; // Reset to center
        }

        return { x: newX, y: newY };
      });

    }, 2000); // 2 seconds real time = 1 minute game time (180s total match)

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [tactic]);

  return (
    <GameFrame title="Partida ao Vivo" kicker="RODADA 18 · MOTOR 2D">
      <div className="match-hud">
        <div className="hud-team">
          <span className="brand-mark">FC</span> FC Aurora
        </div>
        <div className="hud-score">
          {matchData.homeScore} — {matchData.awayScore}
        </div>
        <div className="hud-time">
          AO VIVO • {matchData.minute}&apos;
        </div>
      </div>

      <div className="match-arena">
        {/* 2D PITCH ENGINE */}
        <div className="match-pitch-container">
          <div className="pitch-2d">
            <div className="pitch-lines"></div>
            <div className="penalty-area-home"></div>
            <div className="penalty-area-away"></div>
            
            {/* The Ball */}
            <div className="ball-2d" style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}></div>
            
            {/* Dynamic Player Tokens following the ball roughly */}
            <div className="player-token player-home" style={{ left: `${Math.max(5, ballPos.x - 5)}%`, top: `${ballPos.y}%` }}>ATA</div>
            <div className="player-token player-home" style={{ left: `${Math.max(5, ballPos.x - 15)}%`, top: `${Math.max(5, ballPos.y - 15)}%` }}>MEI</div>
            <div className="player-token player-away" style={{ left: `${Math.min(95, ballPos.x + 5)}%`, top: `${ballPos.y}%` }}>ZAG</div>
          </div>
          
          <div className="match-events">
            {events.map((e, i) => (
              <p key={i}><strong>{matchData.minute}&apos;</strong> {e}</p>
            ))}
          </div>
        </div>

        {/* TACTICS SIDEBAR */}
        <aside className="tactics-sidebar">
          <span className="eyebrow">ESTILO DE JOGO (TEMPO REAL)</span>
          <button className={`tactics-btn ${tactic === "atk" ? "active-atk" : ""}`} onClick={() => setTactic("atk")}>↗ Todos ao Ataque</button>
          <button className={`tactics-btn ${tactic === "bal" ? "active-bal" : ""}`} onClick={() => setTactic("bal")}>◒ Equilibrado</button>
          <button className={`tactics-btn ${tactic === "def" ? "active-def" : ""}`} onClick={() => setTactic("def")}>◈ Retranca Fechada</button>
        </aside>
      </div>
    </GameFrame>
  );
}

/* =========================================================================
   STORE SCREEN (Holographic Cards)
   ========================================================================= */
export function StoreScreen() {
  const { catalog } = useCatalog();
  const [storeTab, setStoreTab] = useState("Cartões Extremos");
  const [notice, setNotice] = useState("");

  return (
    <GameFrame title="Mercado & Loja" kicker="OSM STORE OFICIAL">
      <div className="page-section">
        {notice && <p style={{color: "var(--accent-green)", fontWeight: 800, marginBottom: "16px"}}>{notice}</p>}
        <div style={{display: "flex", gap: "10px", marginBottom: "20px"}}>
          {["FC coins", "Cartões Extremos", "Arsenal Elemental"].map((tab) => (
            <button key={tab} className="primary-game-button" style={{flex: 1, opacity: storeTab === tab ? 1 : 0.5, borderBottom: storeTab === tab ? "4px solid #994000" : "0"}} onClick={() => setStoreTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {storeTab === "Cartões Extremos" && (
          <div className="store-grid">
            {catalog.players.map((p) => (
              <div key={p.name} className="holo-card" onClick={() => setNotice(`${p.name} contratado com sucesso!`)}>
                <h3 className="holo-rating">{p.rating}</h3>
                <h4 className="holo-name">{p.name}</h4>
                <div style={{marginBottom: "10px", fontSize: "14px"}}>{p.position}</div>
                <div className="holo-price">{p.price} FC Coins</div>
              </div>
            ))}
          </div>
        )}
        
        {storeTab === "FC coins" && (
          <div className="store-grid">
            <div className="holo-card" style={{borderColor: "var(--accent-green)"}} onClick={() => setNotice("Fatura PIX de Starter gerada.")}>
              <h3 className="holo-rating">3k FC</h3>
              <h4 className="holo-name">Starter</h4>
              <div className="holo-price">R$ 14,90</div>
            </div>
            <div className="holo-card" style={{borderColor: "var(--accent-gold)"}} onClick={() => setNotice("Fatura PIX de Ouro gerada.")}>
              <h3 className="holo-rating">40k FC</h3>
              <h4 className="holo-name">Melhor Valor</h4>
              <div className="holo-price">R$ 119,90</div>
            </div>
          </div>
        )}

        {storeTab === "Arsenal Elemental" && (
           <div className="store-grid">
             {catalog.items.map((i) => (
               <div key={i.name} className="holo-card" onClick={() => setNotice(`Item ${i.name} equipado!`)}>
                 <h3 className="holo-rating">+{i.bonus}</h3>
                 <h4 className="holo-name">{i.name}</h4>
                 <div style={{marginBottom: "10px", fontSize: "14px", color: "var(--accent-gold)"}}>{i.power}</div>
                 <div className="holo-price">1200 FC Coins</div>
               </div>
             ))}
           </div>
        )}
      </div>
    </GameFrame>
  );
}

/* =========================================================================
   OTHER SCREENS (Stubs for demonstration using new styles)
   ========================================================================= */
export function CareerScreen() {
  return (
    <GameFrame title="Carreira" kicker="CENTRAL DO CLUBE">
      <div className="page-section">
        <h2>Seja bem-vindo ao FC Manager</h2>
        <p>Acesse o menu lateral para iniciar sua Partida 2D ou acessar a Loja.</p>
        <br/>
        <Link href="/live-match" className="primary-game-button">Jogar Partida 2D Agora</Link>
      </div>
    </GameFrame>
  );
}

export function ChooseLeagueScreen() { return <CareerScreen />; }
export function LineupScreen() { return <CareerScreen />; }
export function AdminScreen() { return <CareerScreen />; }
