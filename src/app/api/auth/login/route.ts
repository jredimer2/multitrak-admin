import { NextRequest } from "next/server";
import { getAdminUser } from "@/lib/dal";
import { verifyPassword } from "@/lib/password";
import { signSession, serializeCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { email, password } = body || {};
  if (typeof email !== "string" || typeof password !== "string") {
    return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
  }
  const user = await getAdminUser(email);
  if (!user || !user.verified) {
    return new Response(JSON.stringify({ error: "Account not verified" }), { status: 401 });
  }
  const stored = user.password;
  if (!stored?.salt || !stored?.hash) {
    return new Response(JSON.stringify({ error: "No password set" }), { status: 401 });
  }
  const ok = await verifyPassword(password, stored.salt, stored.hash);
  if (!ok) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
  }
  const token = signSession({ email, iat: Date.now() });
  const headers = new Headers({
    "Set-Cookie": serializeCookie("session", token, { maxAge: 60 * 60 * 8 }), // 8 hours
    "Content-Type": "application/json",
  });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}