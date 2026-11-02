import { describe, expect, test } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  test("allows requests up to the limit, then blocks", () => {
    const allow = createRateLimiter({ limit: 2, windowMs: 1000 });

    expect([allow("a", 0), allow("a", 1), allow("a", 2)]).toEqual([
      true,
      true,
      false,
    ]);
  });

  test("allows again once the window has passed", () => {
    const allow = createRateLimiter({ limit: 1, windowMs: 1000 });
    allow("a", 0);

    expect(allow("a", 999)).toBe(false);
    expect(allow("a", 1000)).toBe(true);
  });

  test("counts each key separately", () => {
    const allow = createRateLimiter({ limit: 1, windowMs: 1000 });
    allow("a", 0);

    expect(allow("b", 0)).toBe(true);
  });

  test("forgets expired keys once many have built up", () => {
    const allow = createRateLimiter({ limit: 1, windowMs: 1000 });
    Array.from({ length: 1000 }, (_, key) => allow(String(key), 0));

    allow("new visitor", 1000);

    expect(allow.tracked()).toBe(1);
  });

  test("keeps keys that are still inside their window", () => {
    const allow = createRateLimiter({ limit: 1, windowMs: 1000 });
    Array.from({ length: 1000 }, (_, key) => allow(String(key), 0));

    allow("new visitor", 999);

    expect(allow("0", 999)).toBe(false);
  });
});
