import { NextResponse } from "next/server";

import { callGameApi, readApiPayload } from "@/app/lib/server-api";

export async function GET() {
  const upstream = await callGameApi("/api/v1/auth/me");
  const { payload, status } = await readApiPayload(upstream);
  return NextResponse.json(payload, { status });
}
