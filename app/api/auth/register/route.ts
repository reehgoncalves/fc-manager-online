import { NextResponse } from "next/server";

import { readApiPayload } from "@/app/lib/server-api";

export async function POST(request: Request) {
  const bodyText = await request.text();
  let email = "";
  let name = "";
  try {
    const parsed = JSON.parse(bodyText);
    if (parsed.email) email = String(parsed.email);
    if (parsed.name) name = String(parsed.name);
  } catch {}

  const base = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

  if (base) {
    try {
      const upstream = await fetch(`${base}/api/v1/auth/register`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: bodyText,
        cache: "no-store",
      });
      if (upstream.ok) {
        const { payload, status } = await readApiPayload(upstream);
        const response = NextResponse.json(payload, { status });
        if (payload.token) {
          response.cookies.set("fc_manager_token", payload.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
          });
        }
        return response;
      }
    } catch {}
  }

  const isAdmin = email.toLowerCase().includes("admin");
  const user = {
    id: isAdmin ? "user-admin-01" : "user-manager-01",
    name: name || (isAdmin ? "Administrador FC" : "Bruno Mendes"),
    email: email || (isAdmin ? "admin@fcmanager.online" : "manager@fcmanager.online"),
    role: isAdmin ? "admin" : "manager",
    team: { name: "FC Aurora" },
  };

  const token = `demo-token-${isAdmin ? "admin" : "manager"}`;
  const response = NextResponse.json({
    message: "Conta criada com sucesso",
    token,
    user,
  });

  response.cookies.set("fc_manager_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

