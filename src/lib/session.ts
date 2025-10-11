import crypto from "crypto";
import { cookies } from "next/headers";

type SessionPayload = {
  email: string;
  iat: number;
};

const base64url = (input: Buffer | string) =>
  (typeof input === "string" ? Buffer.from(input) : input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

function timingSafeEqual(a: string, b: string) {
  const abuf = Buffer.from(a);
  const bbuf = Buffer.from(b);
  if (abuf.length !== bbuf.length) return false;
  return crypto.timingSafeEqual(abuf, bbuf);
}

function getSecret() {
  return process.env.SESSION_SECRET || "dev-session-secret";
}

export function signSession(payload: SessionPayload) {
  const secret = getSecret();
  const data = base64url(JSON.stringify(payload));
  const sig = base64url(crypto.createHmac("sha256", secret).update(data).digest());
  return `${data}.${sig}`;
}

export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = base64url(crypto.createHmac("sha256", getSecret()).update(data).digest());
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    const json = Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const payload = JSON.parse(json) as SessionPayload;
    return typeof payload?.email === "string" ? payload : null;
  } catch {
    return null;
  }
}

type CookieOpts = {
  maxAge?: number; // seconds
};

export function serializeCookie(name: string, value: string, opts: CookieOpts = {}) {
  const maxAge = typeof opts.maxAge === "number" ? opts.maxAge : 60 * 60 * 24; // 1 day
  const parts = [
    `${name}=${value}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function clearCookie(name: string) {
  const parts = [
    `${name}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export async function getSessionFromCookies() {
  const jar = await cookies();
  const token = jar.get("session")?.value || null;
  return verifySession(token);
}