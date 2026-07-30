import { useState, useEffect } from "react";

export type GamePlayer = {
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

export type Catalog = {
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
  wallet?: { balance: number };
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
];

export const catalogFallback: Catalog = {
  source: "local-seed",
  generatedAt: "local",
  players,
  teams: ["FC Aurora", "São Paulo Kings", "Porto Legends", "Rio Bulls", "Bahia United", "Mineiro Club"],
  teamAssets: [
    { name: "FC Aurora", country: "BR", flagUrl: "https://flagcdn.com/w40/br.png" },
    { name: "São Paulo Kings", country: "BR", flagUrl: "https://flagcdn.com/w40/br.png" },
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
  ],
  stadiums: [{
    name: "Estádio Aurora",
    capacity: "42.500",
    level: "24",
    upgrades: [
      { name: "Arquibancada norte", level: "Nível 06", value: "18.000", progress: 82, icon: "▥", tone: "mint" },
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

export function useCatalog() {
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
