type Window = { count: number; resetAt: number };

// In memory, which is enough for the single server this site runs on. Better
// Auth has its own limiter for the login routes.
export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}) {
  const windows = new Map<string, Window>();

  return (key: string, now: number = Date.now()) => {
    const current = windows.get(key);

    if (!current || now >= current.resetAt) {
      windows.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (current.count >= limit) return false;

    windows.set(key, { ...current, count: current.count + 1 });
    return true;
  };
}
