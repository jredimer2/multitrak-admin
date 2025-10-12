import { NextRequest } from "next/server";
import { clearCookie } from "@/lib/session";

export async function POST(_req: NextRequest) {
  const headers = new Headers({
    "Set-Cookie": clearCookie("session"),
    "Content-Type": "application/json",
  });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}