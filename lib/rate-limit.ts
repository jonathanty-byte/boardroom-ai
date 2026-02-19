// Simple in-memory rate limiter for Edge Runtime.
// Each Edge instance has its own memory, so limits are approximate.
// For a portfolio project, this is sufficient to prevent abuse.

const DEMO_LIMIT_PER_DAY = 50;
const ipCounts = new Map<string, { count: number; resetAt: number }>();

export function checkDemoRateLimit(ip: string): { limited: boolean; remaining: number } {
  const now = Date.now();
  const entry = ipCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + 24 * 60 * 60 * 1000;
    ipCounts.set(ip, { count: 1, resetAt });
    return { limited: false, remaining: DEMO_LIMIT_PER_DAY - 1 };
  }

  if (entry.count >= DEMO_LIMIT_PER_DAY) {
    return { limited: true, remaining: 0 };
  }

  entry.count++;
  return { limited: false, remaining: DEMO_LIMIT_PER_DAY - entry.count };
}
