import 'server-only';

// Distributed rate limiting via Vercel KV (Redis).
// Falls back to in-memory if KV env vars are not set (local dev / before KV is linked).

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory fallback store
const memoryStore = new Map<string, RateLimitEntry>();

const kvAvailable =
  typeof process.env.KV_REST_API_URL === 'string' &&
  typeof process.env.KV_REST_API_TOKEN === 'string';

async function checkWithKV(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const { kv } = await import('@vercel/kv');
  const now = Date.now();
  const kvKey = `rl:${key}`;

  const entry = await kv.get<RateLimitEntry>(kvKey);

  if (!entry || entry.resetAt < now) {
    const next: RateLimitEntry = { count: 1, resetAt: now + windowMs };
    await kv.set(kvKey, next, { px: windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  const updated: RateLimitEntry = { ...entry, count: entry.count + 1 };
  const ttl = entry.resetAt - now;
  await kv.set(kvKey, updated, { px: ttl });
  return { allowed: true, remaining: maxRequests - updated.count };
}

function checkWithMemory(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  if (kvAvailable) {
    return checkWithKV(key, maxRequests, windowMs);
  }
  return checkWithMemory(key, maxRequests, windowMs);
}
