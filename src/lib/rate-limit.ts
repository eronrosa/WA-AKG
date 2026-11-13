/**
 * In-memory fixed-window rate limiter keyed by client IP.
 * Suitable for a single-instance deployment (one Node process).
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number) {
    if (now - lastSweep < 60_000) return;
    lastSweep = now;
    for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key);
    }
}

/** Returns true when the key has exceeded `limit` requests within `windowMs`. */
export function isRateLimited(key: string, limit: number, windowMs = 60_000): boolean {
    const now = Date.now();
    sweep(now);
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return false;
    }
    bucket.count += 1;
    return bucket.count > limit;
}

/** Best-effort client IP. Behind a reverse proxy the first X-Forwarded-For entry is used. */
export function getClientIp(request: { headers: Headers }): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return request.headers.get("x-real-ip") || "unknown";
}
