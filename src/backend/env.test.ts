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
  RAZORPAY_KEY_ID: "rzp_live_abc",
  RAZORPAY_KEY_SECRET: "secret",
  RAZORPAY_WEBHOOK_SECRET: "webhook-secret",
  CRON_SECRET: "cron-secret",
  ADMIN_EMAILS: "admin@example.org",
};

describe("parseEnv", () => {
  test("holds an unknown environment to the production rules", () => {
    expect(() => parseEnv({ ...VALID, NODE_ENV: "staging" })).toThrow(
      "RAZORPAY_KEY_ID"
    );
  });

  test("holds a missing environment name to the production rules", () => {
    expect(() => parseEnv(VALID)).toThrow("RAZORPAY_KEY_ID");
  });

  test("accepts development config with no outside services", () => {
    const env = parseEnv({ ...VALID, NODE_ENV: "development" });

    expect(env.RESEND_API_KEY).toBeUndefined();
    expect(env.RAZORPAY_KEY_ID).toBeUndefined();
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
    "RESEND_API_KEY",
    "EMAIL_FROM",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
    "CRON_SECRET",
    "ADMIN_EMAILS",
  ] as const)("requires %s in production", (key) => {
    const raw: Record<string, string> = { ...PRODUCTION };
    delete raw[key];

    expect(() => parseEnv(raw)).toThrow(key);
  });

  test("rejects a plain http site address in production", () => {
    expect(() =>
      parseEnv({ ...PRODUCTION, BETTER_AUTH_URL: "http://sass.example.org" })
    ).toThrow("BETTER_AUTH_URL");
  });

  test("accepts complete production config", () => {
    expect(parseEnv(PRODUCTION).EMAIL_FROM).toBe("SASS <no-reply@example.org>");
  });

  test("reads admin emails as a tidy list", () => {
    const env = parseEnv({
      ...VALID,
      NODE_ENV: "development",
      ADMIN_EMAILS: " Admin@Example.org, second@example.org ,",
    });

    expect(env.ADMIN_EMAILS).toEqual(["admin@example.org", "second@example.org"]);
  });
});
