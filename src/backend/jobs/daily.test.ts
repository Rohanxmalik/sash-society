import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { memberships, payments } from "@/backend/db/schema";
import { fulfilPayment } from "@/backend/payments/fulfil";
import { createMembershipOrder } from "@/backend/payments/orders";
import {
  addLiveMembership,
  addMember,
  createHarness,
  NOW,
  type Harness,
} from "@/backend/test/harness";
import { runDailyJob } from "./daily";

let harness: Harness;
const db = () => harness.testDb.db;

const daysFromNow = (days: number) =>
  new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000);

beforeEach(async () => {
  harness = await createHarness();
});

afterEach(async () => {
  await harness.testDb.close();
  vi.restoreAllMocks();
});

describe("expiring memberships", () => {
  test("marks lapsed memberships as expired", async () => {
    const member = await addMember(harness);
    await addLiveMembership(harness, member.id, { expiresAt: daysFromNow(-1) });

    const result = await runDailyJob(harness.deps);

    expect(result.expired).toBe(1);
    const [row] = await db().select().from(memberships);
    expect(row.status).toBe("expired");
  });

  test("leaves life memberships alone", async () => {
    const member = await addMember(harness);
    await addLiveMembership(harness, member.id, { expiresAt: null });

    const result = await runDailyJob(harness.deps);

    expect(result.expired).toBe(0);
  });
});

describe("renewal reminders", () => {
  test("emails members within 30 days of expiry", async () => {
    const member = await addMember(harness);
    await addLiveMembership(harness, member.id, { expiresAt: daysFromNow(20) });

    const result = await runDailyJob(harness.deps);

    expect(result.reminded).toBe(1);
    expect(harness.mail[0].subject).toContain("expires soon");
    expect(harness.mail[0].text).toContain(
      "https://sass.example.org/membership"
    );
  });

  test("reminds only once", async () => {
    const member = await addMember(harness);
    await addLiveMembership(harness, member.id, { expiresAt: daysFromNow(20) });

    await runDailyJob(harness.deps);
    const second = await runDailyJob(harness.deps);

    expect(second.reminded).toBe(0);
    expect(harness.mail).toHaveLength(1);
  });

  test("does not remind members with plenty of time left", async () => {
    const member = await addMember(harness);
    await addLiveMembership(harness, member.id, { expiresAt: daysFromNow(90) });

    expect((await runDailyJob(harness.deps)).reminded).toBe(0);
  });

  test("keeps going when one reminder fails", async () => {
    const first = await addMember(harness, "user-1");
    const second = await addMember(harness, "user-2");
    await addLiveMembership(harness, first.id, { expiresAt: daysFromNow(20) });
    await addLiveMembership(harness, second.id, { expiresAt: daysFromNow(20) });
    vi.spyOn(console, "error").mockImplementation(() => {});
    let attempts = 0;
    harness.deps.sendEmail = async () => {
      attempts += 1;
      if (attempts === 1) throw new Error("Resend is down");
    };

    const result = await runDailyJob(harness.deps);

    expect(attempts).toBe(2);
    expect(result.reminded).toBe(1);
  });
});

describe("retrying failed emails", () => {
  async function paidWithFailedEmail() {
    const member = await addMember(harness);
    const result = await createMembershipOrder(harness.deps, member, {
      planSlug: "student",
      declarationAccepted: true,
    });
    if (!result.ok) throw new Error(result.message);
    const working = harness.deps.sendEmail;
    vi.spyOn(console, "error").mockImplementation(() => {});
    harness.deps.sendEmail = async () => {
      throw new Error("Resend is down");
    };
    await fulfilPayment(harness.deps, {
      orderId: result.order.orderId,
      paymentId: harness.gateway.paymentIdFor(result.order),
    });
    harness.deps.sendEmail = working;
    await db()
      .update(payments)
      .set({ paidAt: daysFromNow(-1) })
      .where(eq(payments.razorpayOrderId, result.order.orderId));
  }

  test("sends what could not be sent earlier", async () => {
    await paidWithFailedEmail();

    const result = await runDailyJob(harness.deps);

    expect(result.retried).toBe(1);
    expect(harness.mail[0].subject).toContain("Welcome");
    const [payment] = await db().select().from(payments);
    expect(payment.emailSentAt).not.toBeNull();
  });

  test("does not email payments waiting on a person", async () => {
    await paidWithFailedEmail();
    await db().update(payments).set({ note: "Duplicate payment" });

    const result = await runDailyJob(harness.deps);

    expect(result.retried).toBe(0);
  });
});
