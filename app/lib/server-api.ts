import { cookies } from "next/headers";

const apiBase = () => (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export async function callGameApi(path: string, init: RequestInit = {}) {
  const base = apiBase();
  if (!base) return new Response(JSON.stringify({ message: "API do jogo ainda não está configurada." }), { status: 503, headers: { "Content-Type": "application/json" } });
  const token = (await cookies()).get("fc_manager_token")?.value;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${base}${path}`, { ...init, headers, cache: "no-store" });
}

export async function readApiPayload(response: Response) {
  const payload = await response.json().catch(() => ({ message: "Não foi possível interpretar a resposta da API." }));
  return { payload, status: response.status };
}
