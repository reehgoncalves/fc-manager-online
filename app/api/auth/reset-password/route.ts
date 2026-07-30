import { NextResponse } from "next/server";

import { readApiPayload } from "@/app/lib/server-api";

export async function POST(request: Request) {
  const base = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  if (!base) return NextResponse.json({ message: "API do jogo ainda não está configurada." }, { status: 503 });
  const upstream = await fetch(base + "/api/v1/auth/reset-password", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: await request.text(), cache: "no-store" });
  const { payload, status } = await readApiPayload(upstream);
  return NextResponse.json(payload, { status });
}
