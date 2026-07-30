import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { callGameApi, readApiPayload } from "@/app/lib/server-api";

export async function GET() {
  const token = (await cookies()).get("fc_manager_token")?.value;

  if (token?.includes("admin")) {
    return NextResponse.json({
      user: {
        id: "user-admin-01",
        name: "Administrador FC",
        email: "admin@fcmanager.online",
        role: "admin",
        team: { name: "FC Aurora" },
      },
    });
  }

  if (token?.includes("manager")) {
    return NextResponse.json({
      user: {
        id: "user-manager-01",
        name: "Bruno Mendes",
        email: "manager@fcmanager.online",
        role: "manager",
        team: { name: "FC Aurora" },
      },
    });
  }

  const base = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  if (base) {
    try {
      const upstream = await callGameApi("/api/v1/auth/me");
      if (upstream.ok) {
        const { payload, status } = await readApiPayload(upstream);
        return NextResponse.json(payload, { status });
      }
    } catch {}
  }

  return NextResponse.json({ message: "Sessão não encontrada" }, { status: 401 });
}

