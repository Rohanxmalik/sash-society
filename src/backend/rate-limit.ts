type Window = { count: number; resetAt: number };

// Far more visitors than one window sees, so sweeping is rare.
const SWEEP_AT_KEYS = 1000;

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

  const forgetExpired = (now: number) => {
    windows.forEach(({ resetAt }, key) => {
      if (now >= resetAt) windows.delete(key);
    });
  };

  const allow = (key: string, now: number = Date.now()) => {
    const current = windows.get(key);

    if (!current || now >= current.resetAt) {
      if (windows.size >= SWEEP_AT_KEYS) forgetExpired(now);
      windows.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (current.count >= limit) return false;

    windows.set(key, { ...current, count: current.count + 1 });
    return true;
  };

  return Object.assign(allow, { tracked: () => windows.size });
}
