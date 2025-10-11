import { NextRequest } from "next/server";
import { getVerificationCode, deleteVerificationCode, putAdminUser } from "@/lib/dal";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { email, code } = body || {};
  if (typeof email !== "string" || typeof code !== "string") {
    return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
  }
  const pending = await getVerificationCode(email);
  // Reject if code mismatch or expired by TTL if present
  const nowSec = Math.floor(Date.now() / 1000);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const expired = typeof (pending as any)?.ttl === "number" && (pending as any).ttl < nowSec;
  if (!pending || pending.code !== code || expired) {
    return new Response(JSON.stringify({ error: "Invalid code" }), { status: 401 });
  }
  await deleteVerificationCode(email);
  await putAdminUser(email, { verified: true, verified_at: Date.now(), password: pending.password });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}