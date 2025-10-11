import { clearCookie } from "@/lib/session";

export async function POST() {
  const headers = new Headers({
    "Set-Cookie": clearCookie("session"),
    Location: "/auth/login",
  });
  return new Response(null, { status: 302, headers });
}