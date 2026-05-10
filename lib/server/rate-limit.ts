import "server-only";
import { RATE_LIMIT } from "@/config/security";

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

// Prune expired buckets every 5 minutes so the Map doesn't grow unbounded
setInterval(
  () => {
    const now = Date.now();
    for (const [key, bucket] of store) {
      if (bucket.resetAt < now) store.delete(key);
    }
  },
  5 * 60 * 1000
);

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  let bucket = store.get(ip);

  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + RATE_LIMIT.windowMs };
    store.set(ip, bucket);
  }

  bucket.count += 1;

  if (bucket.count > RATE_LIMIT.maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  return { allowed: true };
}
