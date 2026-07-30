import { NextResponse } from "next/server";

import { callGameApi } from "@/app/lib/server-api";

export async function POST() {
  try {
    await callGameApi("/api/v1/auth/logout", { method: "DELETE" }).catch(() => undefined);
  } catch {}

  const response = NextResponse.json({ message: "Logout realizado com sucesso" }, { status: 200 });
  response.cookies.set("fc_manager_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

