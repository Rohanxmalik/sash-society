import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ env: {} as Record<string, string> }));

vi.mock("@/backend/env", () => ({ getEnv: () => mocks.env }));
vi.mock("@/backend/db", () => ({ getDb: () => ({}) }));

const BASE_ENV = { BETTER_AUTH_URL: "https://sass.example.org" };

// The gateway and mailer are kept between calls, so each test needs a fresh copy.
async function freshRuntime() {
  vi.resetModules();
  return import("./runtime");
}

beforeEach(() => {
  mocks.env = BASE_ENV;
});

describe("getPaymentDeps", () => {
  test("uses Razorpay when the keys are set", async () => {
    mocks.env = {
      ...BASE_ENV,
      RAZORPAY_KEY_ID: "rzp_test_abc",
      RAZORPAY_KEY_SECRET: "secret",
    };
    const { getPaymentDeps } = await freshRuntime();

    expect(getPaymentDeps().gateway.provider).toBe("razorpay");
  });

  test("uses the fake gateway without keys", async () => {
    const { getPaymentDeps } = await freshRuntime();

    expect(getPaymentDeps().gateway.provider).toBe("fake");
  });

  test("needs both keys before it uses Razorpay", async () => {
    mocks.env = { ...BASE_ENV, RAZORPAY_KEY_ID: "rzp_test_abc" };
    const { getPaymentDeps } = await freshRuntime();

    expect(getPaymentDeps().gateway.provider).toBe("fake");
  });

  test("reuses one gateway and passes on the site address", async () => {
    const { getPaymentDeps } = await freshRuntime();

    const first = getPaymentDeps();
    const second = getPaymentDeps();

    expect(second.gateway).toBe(first.gateway);
    expect(first.baseURL).toBe("https://sass.example.org");
  });
});

describe("getMailer", () => {
  test("reuses one mailer", async () => {
    const { getMailer } = await freshRuntime();

    expect(getMailer()).toBe(getMailer());
  });
});
