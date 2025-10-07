type PendingUser = { email: string; code: string; createdAt: number; password?: string };
type VerifiedUser = { email: string; verifiedAt: number };

const memory = {
  pending: new Map<string, PendingUser>(),
  users: new Map<string, VerifiedUser>(),
};

export function addPendingUser(email: string, code: string, password?: string) {
  const entry: PendingUser = { email, code, password, createdAt: Date.now() };
  memory.pending.set(email.toLowerCase(), entry);
  return entry;
}

export function getPendingUser(email: string) {
  return memory.pending.get(email.toLowerCase()) || null;
}

export function verifyUser(email: string) {
  const pending = memory.pending.get(email.toLowerCase());
  if (!pending) return null;
  const verified: VerifiedUser = { email: pending.email, verifiedAt: Date.now() };
  memory.users.set(email.toLowerCase(), verified);
  memory.pending.delete(email.toLowerCase());
  return verified;
}

export function getUser(email: string) {
  return memory.users.get(email.toLowerCase()) || null;
}