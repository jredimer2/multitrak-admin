import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);

export async function hashPassword(password: string, salt?: string) {
  const useSalt = salt || crypto.randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, useSalt, 64)) as Buffer;
  const hash = derived.toString("hex");
  return { salt: useSalt, hash };
}

export async function verifyPassword(password: string, salt: string, hash: string) {
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const computed = derived.toString("hex");
  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}