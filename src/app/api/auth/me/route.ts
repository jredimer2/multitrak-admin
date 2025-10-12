import { NextRequest } from "next/server";
import { getSessionFromCookies } from "@/lib/session";

export async function GET(_req: NextRequest) {
  const session = await getSessionFromCookies();
  const email = session?.email || null;
  return new Response(JSON.stringify({ email }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}