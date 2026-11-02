import { describe, expect, test } from "vitest";
import { parseEnv } from "./env";

const VALID = {
  DATABASE_URL: "postgres://user:pass@localhost:5432/db",
  BETTER_AUTH_SECRET: "a".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000",
};

const PRODUCTION = {
  ...VALID,
  NODE_ENV: "production",
  BETTER_AUTH_URL: "https://sass.example.org",
  RESEND_API_KEY: "re_123",
  EMAIL_FROM: "SASS <no-reply@example.org>",
};

describe("parseEnv", () => {
  test("accepts development config without an email provider", () => {
    const env = parseEnv({ ...VALID, NODE_ENV: "development" });
    expect(env.RESEND_API_KEY).toBeUndefined();
  });

  test.each(["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"] as const)(
    "names %s in the error when it is missing",
    (key) => {
      const raw: Record<string, string> = { ...VALID };
      delete raw[key];
      expect(() => parseEnv(raw)).toThrow(key);
    }
  );

  test("rejects a secret shorter than 32 characters", () => {
    expect(() =>
      parseEnv({ ...VALID, BETTER_AUTH_SECRET: "short" })
    ).toThrow("BETTER_AUTH_SECRET");
  });

  test("treats blank values copied from .env.example as missing", () => {
    expect(() => parseEnv({ ...VALID, BETTER_AUTH_SECRET: "" })).toThrow(
      "BETTER_AUTH_SECRET"
    );
  });

  test.each([
    ["RESEND_API_KEY", { EMAIL_FROM: "SASS <no-reply@example.org>" }],
    ["EMAIL_FROM", { RESEND_API_KEY: "re_123" }],
  ])("requires %s in production", (missing, present) => {
    expect(() =>
      parseEnv({ ...VALID, ...present, NODE_ENV: "production" })
    ).toThrow(missing);
  });

  test("rejects a plain http site address in production", () => {
    expect(() =>
      parseEnv({ ...PRODUCTION, BETTER_AUTH_URL: "http://sass.example.org" })
    ).toThrow("BETTER_AUTH_URL");
  });

  test("accepts production config with an email provider", () => {
    expect(parseEnv(PRODUCTION).EMAIL_FROM).toBe("SASS <no-reply@example.org>");
  });
});
