interface TokenBucket {
  tokens: number;
  lastRefillTimestamp: number;
}

const memoryStore = new Map<string, TokenBucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

export function checkRateLimit(
  key: string,
  capacity = 5,
  refillWindowSeconds = 60
): RateLimitResult {
  const now = Date.now();
  const bucket = memoryStore.get(key) || {
    tokens: capacity,
    lastRefillTimestamp: now,
  };

  const elapsedSeconds = (now - bucket.lastRefillTimestamp) / 1000;
  const tokensToAdd = elapsedSeconds * (capacity / refillWindowSeconds);

  bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd);
  bucket.lastRefillTimestamp = now;

  if (bucket.tokens >= 1.0) {
    bucket.tokens -= 1.0;
    memoryStore.set(key, bucket);
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetInSeconds: Math.ceil((1.0 - (bucket.tokens % 1.0)) * (refillWindowSeconds / capacity)),
    };
  }

  memoryStore.set(key, bucket);
  const waitSeconds = Math.ceil((1.0 - bucket.tokens) * (refillWindowSeconds / capacity));
  return {
    allowed: false,
    remaining: 0,
    resetInSeconds: waitSeconds,
  };
}
