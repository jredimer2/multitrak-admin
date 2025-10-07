import { NextRequest } from "next/server";
import { sendMail } from "@/lib/email";
import { logRestoreAttempt } from "@/lib/dal";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { userId, filename, performedBy } = body || {};
  if (!userId || !filename || !performedBy) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }
  const attempt_ts = Date.now();
  await logRestoreAttempt({
    userId,
    attempt_ts,
    filename,
    performed_by: performedBy,
    status: "attempted",
  });

  await sendMail({
    to: "admin@ezytask.io",
    subject: `Backup restore attempted for user ${userId}`,
    text: `User ID: ${userId}\nFile: ${filename}\nPerformed By: ${performedBy}`,
  });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}