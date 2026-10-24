'use strict';

/**
 * Tiny dependency-free fixed-window rate limiter.
 * Enough for a single-instance Node server; swap for a shared store when running
 * multiple processes behind a load balancer.
 */
function createRateLimiter({ windowMs = 10 * 60 * 1000, max = 5 } = {}) {
  const hits = new Map();

  function prune(now) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }

  /**
   * @returns {{allowed: boolean, remaining: number, retryAfterSeconds: number}}
   */
  function check(key, now = Date.now()) {
    if (hits.size > 5000) prune(now);

    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: max - 1, retryAfterSeconds: Math.ceil(windowMs / 1000) };
    }

    entry.count += 1;
    const allowed = entry.count <= max;
    return {
      allowed,
      remaining: Math.max(0, max - entry.count),
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  function reset(key) {
    hits.delete(key);
  }

  return { check, reset };
}

module.exports = { createRateLimiter };
