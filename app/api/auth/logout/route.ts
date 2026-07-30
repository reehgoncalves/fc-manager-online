import { NextResponse } from "next/server";

import { callGameApi, readApiPayload } from "@/app/lib/server-api";

export async function POST() {
  const upstream = await callGameApi("/api/v1/auth/logout", { method: "DELETE" });
  const { payload, status } = await readApiPayload(upstream);
  const response = NextResponse.json(payload, { status });
  response.cookies.delete("fc_manager_token");
  return response;
}
