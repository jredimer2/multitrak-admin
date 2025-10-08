import { NextRequest } from "next/server";
import { sendMail } from "@/lib/email";
import { putVerificationCode } from "@/lib/dal";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { email } = body || {};
  if (typeof email !== "string" || !email.includes("@")) {
    return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400 });
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // Store code in DynamoDB with TTL of 15 minutes
  await putVerificationCode(email, code, 15 * 60);

  await sendMail({
    to: "admin@ezytask.io",
    subject: `Admin signup verification code for ${email}`,
    text: `Verification code: ${code}`,
  });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}