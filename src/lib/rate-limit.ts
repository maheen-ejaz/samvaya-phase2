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
  // In production, fail closed if distributed rate limiting is not configured.
  // In-memory limits are per-instance and trivially bypassed by spreading requests
  // across serverless invocations — so we block rather than allow.
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '[rate-limit] KV not configured in production — blocking request. ' +
        'Set KV_REST_API_URL and KV_REST_API_TOKEN.'
    );
    return { allowed: false, remaining: 0 };
  }
  return checkWithMemory(key, maxRequests, windowMs);
}

/**
 * Consume a quantity from a budget counter (e.g., Claude token usage). Unlike
 * checkRateLimit which increments by 1 per call, this increments by `amount`
 * and rejects when the running total would exceed `maxBudget` in `windowMs`.
 * Use it before an expensive external call to pre-check, OR after to record
 * actuals — recording after is more accurate but lets a burst through.
 */
export async function consumeBudget(
  key: string,
  maxBudget: number,
  windowMs: number,
  amount: number
): Promise<{ allowed: boolean; remaining: number }> {
  if (!kvAvailable) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[budget] KV not configured in production — blocking');
      return { allowed: false, remaining: 0 };
    }
    // In-memory fallback for dev
    const now = Date.now();
    const entry = memoryStore.get(key);
    if (!entry || entry.resetAt < now) {
      memoryStore.set(key, { count: amount, resetAt: now + windowMs });
      return { allowed: amount <= maxBudget, remaining: Math.max(0, maxBudget - amount) };
    }
    if (entry.count + amount > maxBudget) {
      return { allowed: false, remaining: Math.max(0, maxBudget - entry.count) };
    }
    entry.count += amount;
    return { allowed: true, remaining: maxBudget - entry.count };
  }

  const { kv } = await import('@vercel/kv');
  const now = Date.now();
  const kvKey = `budget:${key}`;
  const entry = await kv.get<RateLimitEntry>(kvKey);

  if (!entry || entry.resetAt < now) {
    const next: RateLimitEntry = { count: amount, resetAt: now + windowMs };
    await kv.set(kvKey, next, { px: windowMs });
    return { allowed: amount <= maxBudget, remaining: Math.max(0, maxBudget - amount) };
  }

  if (entry.count + amount > maxBudget) {
    return { allowed: false, remaining: Math.max(0, maxBudget - entry.count) };
  }

  const updated: RateLimitEntry = { count: entry.count + amount, resetAt: entry.resetAt };
  const ttl = entry.resetAt - now;
  await kv.set(kvKey, updated, { px: ttl });
  return { allowed: true, remaining: maxBudget - updated.count };
}
