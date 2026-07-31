/**
 * /api/match/stream/route.ts
 *
 * Server-Sent Events endpoint for live match simulation.
 * Emits match events every 2 seconds (= 1 minute of game time).
 * When Laravel API is ready, this route proxies to the real match engine.
 */

export const runtime = "edge";

type MatchState = {
  minute: number;
  homeScore: number;
  awayScore: number;
  homePower: number;
  awayPower: number;
  ballX: number;
  ballY: number;
  tactic: string;
  events: Array<{ minute: number; type: string; text: string }>;
  players: Array<{ id: string; x: number; y: number; team: "home" | "away"; pos: string; name: string }>;
  status: "live" | "halftime" | "finished";
};

// Formation positions (0–100 % of pitch)
const FORMATIONS: Record<string, { home: [number, number][]; away: [number, number][] }> = {
  "4-4-2": {
    home: [
      [50, 92], // GK
      [20, 72],[37, 72],[63, 72],[80, 72], // DEF
      [20, 52],[37, 52],[63, 52],[80, 52], // MID
      [35, 28],[65, 28], // ATT
    ],
    away: [
      [50, 8], // GK
      [20, 28],[37, 28],[63, 28],[80, 28], // DEF
      [20, 48],[37, 48],[63, 48],[80, 48], // MID
      [35, 72],[65, 72], // ATT
    ],
  },
};

const HOME_PLAYERS = [
  "GK: E.Vidal","DEF: R.Lima","DEF: R.Nasc","DEF: T.Silva","DEF: A.Telles",
  "MEI: M.Costa","MEI: L.Gomes","MEI: F.Dias","MEI: C.Sousa",
  "ATA: L.Andre","ATA: V.Neto",
];

const AWAY_PLAYERS = [
  "GK: D.Lopez","DEF: M.Ramos","DEF: P.Gael","DEF: C.Ferro","DEF: J.Rios",
  "MEI: A.Vega","MEI: E.Nunez","MEI: R.Paz","MEI: S.Cruz",
  "ATA: F.Torres","ATA: N.Gil",
];

const NARRATIONS = {
  attack: [
    "Pressão intensa! A bola entra na área adversária.",
    "Transição rápida! Atacantes em posição.",
    "Cruzamento na área — bola sobrando!",
    "Jogada trabalhada com muita qualidade.",
    "Velocidade na ponta, marcação em pânico!",
  ],
  defend: [
    "Defesa bem postada, cortando o avanço.",
    "Bola recuperada no meio campo.",
    "Marcação em bloco, sem espaço para o rival.",
    "Goleiro seguro na saída de bola.",
    "Intervalo bem organizado na defesa.",
  ],
  neutral: [
    "Jogo equilibrado, bola circulando.",
    "Primeira metade de muita intensidade.",
    "Meio campo dominado, buscando os espaços.",
    "Nenhuma equipe consegue criar com clareza.",
    "Ritmo de jogo alto, o estádio está em pé!",
  ],
  goal: [
    "GOOOOL! Que golaço espetacular!",
    "GOL! A rede balança! A torcida explode!",
    "GOL! Finalização precisa e sem chances pro goleiro!",
    "GOOOOOL! Saiu o primeiro da partida!",
  ],
  miss: [
    "Quase! A bola passou muito perto do gol!",
    "Defendeu! Grande defesa do goleiro!",
    "Trave! A trave salvou a equipe adversária!",
    "Chute errado! Perdeu uma chance clara de gol!",
  ],
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function getPlayers(
  tactic: string,
  ballX: number,
  ballY: number
): MatchState["players"] {
  const formation = FORMATIONS["4-4-2"];
  const players: MatchState["players"] = [];

  // Home players
  formation.home.forEach(([bx, by], i) => {
    const spread = tactic === "atk" ? -10 : tactic === "def" ? 10 : 0;
    const px = clamp(bx + (Math.random() - 0.5) * 12, 4, 96);
    const py = clamp(by + spread + (Math.random() - 0.5) * 8, 4, 96);
    // Move towards ball
    const dx = (ballX - px) * 0.15;
    const dy = (ballY - py) * 0.15;
    players.push({
      id: `home-${i}`,
      x: clamp(px + dx, 4, 96),
      y: clamp(py + dy, 4, 96),
      team: "home",
      pos: HOME_PLAYERS[i].split(":")[0].trim(),
      name: HOME_PLAYERS[i].split(":")[1].trim(),
    });
  });

  // Away players
  formation.away.forEach(([bx, by], i) => {
    const spread = tactic === "def" ? -10 : tactic === "atk" ? 10 : 0;
    const px = clamp(bx + (Math.random() - 0.5) * 12, 4, 96);
    const py = clamp(by + spread + (Math.random() - 0.5) * 8, 4, 96);
    const dx = (ballX - px) * 0.1;
    const dy = (ballY - py) * 0.1;
    players.push({
      id: `away-${i}`,
      x: clamp(px + dx, 4, 96),
      y: clamp(py + dy, 4, 96),
      team: "away",
      pos: AWAY_PLAYERS[i].split(":")[0].trim(),
      name: AWAY_PLAYERS[i].split(":")[1].trim(),
    });
  });

  return players;
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const tactic = url.searchParams.get("tactic") ?? "bal";

  let minute = 1;
  let homeScore = 0;
  let awayScore = 0;
  let ballX = 50;
  let ballY = 50;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function send(data: object) {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      }

      // Initial state
      send({
        type: "init",
        minute: 0,
        homeScore: 0,
        awayScore: 0,
        homePower: 50,
        awayPower: 50,
        ballX: 50,
        ballY: 50,
        status: "live",
        players: getPlayers(tactic, 50, 50),
        events: [{ minute: 0, type: "system", text: "O árbitro apita o início do jogo!" }],
      });

      const interval = setInterval(() => {
        minute++;

        if (minute > 90) {
          send({
            type: "finished",
            minute: 90,
            homeScore,
            awayScore,
            status: "finished",
            events: [{ minute: 90, type: "final", text: `Fim de jogo! FC Aurora ${homeScore} x ${awayScore} Rio Bulls` }],
          });
          clearInterval(interval);
          controller.close();
          return;
        }

        // Halftime
        if (minute === 45) {
          send({
            type: "halftime",
            minute: 45,
            homeScore,
            awayScore,
            homePower: 50,
            awayPower: 50,
            ballX: 50,
            ballY: 50,
            status: "halftime",
            events: [{ minute: 45, type: "system", text: "Intervalo! As equipes vão para o vestiário." }],
            players: getPlayers(tactic, 50, 50),
          });
          ballX = 50;
          ballY = 50;
          return;
        }

        // Ball movement influenced by tactic
        const tacticBias = tactic === "atk" ? -18 : tactic === "def" ? 18 : 0;
        const moveX = (Math.random() - 0.5) * 22;
        const moveY = (Math.random() - 0.5) * 18 + tacticBias * 0.4;
        ballX = clamp(ballX + moveX, 5, 95);
        ballY = clamp(ballY + moveY, 5, 95);

        // Power calculation
        const homePower = clamp(
          50 + (tactic === "atk" ? 20 : tactic === "def" ? -15 : 0) + (Math.random() - 0.5) * 20,
          20, 80
        );
        const awayPower = 100 - homePower;

        // Determine event
        let eventType = "neutral";
        let eventText = randomFrom(NARRATIONS.neutral);
        let scoreDelta = { home: 0, away: 0 };

        const rand = Math.random();

        if (ballY < 20) {
          // Home attacking
          eventType = "attack";
          eventText = randomFrom(NARRATIONS.attack);
          if (rand > (tactic === "atk" ? 0.72 : 0.82)) {
            homeScore++;
            scoreDelta.home = 1;
            eventType = "goal";
            eventText = randomFrom(NARRATIONS.goal) + ` FC Aurora marca! ${homeScore} x ${awayScore}`;
            ballX = 50;
            ballY = 50;
          } else if (rand > 0.55) {
            eventType = "miss";
            eventText = randomFrom(NARRATIONS.miss);
          }
        } else if (ballY > 80) {
          // Away attacking
          eventType = "defend";
          eventText = randomFrom(NARRATIONS.defend);
          if (rand > (tactic === "def" ? 0.84 : 0.76)) {
            awayScore++;
            scoreDelta.away = 1;
            eventType = "goal";
            eventText = randomFrom(NARRATIONS.goal) + ` Rio Bulls marca! ${homeScore} x ${awayScore}`;
            ballX = 50;
            ballY = 50;
          } else if (rand > 0.55) {
            eventType = "miss";
            eventText = randomFrom(NARRATIONS.miss);
          }
        }

        const players = getPlayers(tactic, ballX, ballY);

        send({
          type: "tick",
          minute,
          homeScore,
          awayScore,
          homePower,
          awayPower,
          ballX,
          ballY,
          status: "live",
          players,
          events: [{ minute, type: eventType, text: eventText }],
          scoreDelta,
        });
      }, 2000); // 2s real = 1min game

      // Clean up if client disconnects
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
