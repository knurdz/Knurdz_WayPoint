import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkRateLimit } from '../rate_limiter';

describe('rate_limiter utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows initial requests up to capacity', () => {
    const key = `test-ip-${Date.now()}-1`;
    const capacity = 3;

    const res1 = checkRateLimit(key, capacity, 60);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit(key, capacity, 60);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit(key, capacity, 60);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);

    // Exceed capacity
    const res4 = checkRateLimit(key, capacity, 60);
    expect(res4.allowed).toBe(false);
    expect(res4.remaining).toBe(0);
    expect(res4.resetInSeconds).toBeGreaterThan(0);
  });

  it('isolates rate limits by client key', () => {
    const keyA = `user-a-${Date.now()}`;
    const keyB = `user-b-${Date.now()}`;

    // Exhaust user A
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(keyA, 5, 60).allowed).toBe(true);
    }
    expect(checkRateLimit(keyA, 5, 60).allowed).toBe(false);

    // User B should still be allowed
    const resB = checkRateLimit(keyB, 5, 60);
    expect(resB.allowed).toBe(true);
    expect(resB.remaining).toBe(4);
  });

  it('refills tokens over time when clock advances', () => {
    const key = `refill-test-${Date.now()}`;
    const capacity = 2;
    const windowSec = 10; // 1 token every 5 seconds

    // Consume all 2 tokens
    expect(checkRateLimit(key, capacity, windowSec).allowed).toBe(true);
    expect(checkRateLimit(key, capacity, windowSec).allowed).toBe(true);
    expect(checkRateLimit(key, capacity, windowSec).allowed).toBe(false);

    // Advance 5 seconds (1 token replenished)
    vi.advanceTimersByTime(5000);

    const resAfterRefill = checkRateLimit(key, capacity, windowSec);
    expect(resAfterRefill.allowed).toBe(true);
    expect(resAfterRefill.remaining).toBe(0);

    // Still blocked immediately after consuming the refilled token
    expect(checkRateLimit(key, capacity, windowSec).allowed).toBe(false);

    // Advance full window (10 seconds) - capacity fully restored
    vi.advanceTimersByTime(10000);
    const resFull = checkRateLimit(key, capacity, windowSec);
    expect(resFull.allowed).toBe(true);
    expect(resFull.remaining).toBe(1);
  });

  it('caps token refill at maximum capacity', () => {
    const key = `cap-test-${Date.now()}`;
    const capacity = 3;

    // Use 1 token
    checkRateLimit(key, capacity, 60);

    // Advance 1 hour into future
    vi.advanceTimersByTime(3600 * 1000);

    // Remaining should be capacity - 1 = 2
    const res = checkRateLimit(key, capacity, 60);
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(2);
  });
});
