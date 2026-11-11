// Blocks password guessing per account: MAX_FAILURES wrong passwords within WINDOW_MS
// lock the email for LOCK_MS. Kept in memory, which is enough for a single server process.
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;

type Entry = { failures: number; windowStart: number; lockedUntil: number };
const entries = new Map<string, Entry>();

const keyOf = (email: string) => email.trim().toLowerCase();

/** Returns the remaining lock time in seconds, or 0 when the email may try again. */
export function loginLockSeconds(email: string): number {
  const entry = entries.get(keyOf(email));
  if (!entry) return 0;
  const remaining = entry.lockedUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

export function recordLoginFailure(email: string) {
  const key = keyOf(email);
  const now = Date.now();
  const entry = entries.get(key);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    entries.set(key, { failures: 1, windowStart: now, lockedUntil: 0 });
    return;
  }
  entry.failures += 1;
  if (entry.failures >= MAX_FAILURES) {
    entry.lockedUntil = now + LOCK_MS;
    entry.failures = 0;
    entry.windowStart = now;
  }
}

export function clearLoginFailures(email: string) {
  entries.delete(keyOf(email));
}
