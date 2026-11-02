import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { memberships, payments } from "@/backend/db/schema";
import { addMember, createHarness, type Harness } from "@/backend/test/harness";
import { fulfilPayment } from "./fulfil";
import { createMembershipOrder } from "./orders";
import { handleWebhookEvent } from "./webhook";

let harness: Harness;

beforeEach(async () => {
  harness = await createHarness();
});

afterEach(async () => {
  await harness.testDb.close();
  vi.restoreAllMocks();
});

async function placeOrder() {
  const member = await addMember(harness);
  const result = await createMembershipOrder(harness.deps, member, {
    planSlug: "student",
    declarationAccepted: true,
  });
  if (!result.ok) throw new Error(result.message);
  return result.order;
}

const capturedEvent = (order: {
  orderId: string;
  amountMinor: number;
  currency: string;
}) => ({
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: harness.gateway.paymentIdFor(order),
        order_id: order.orderId,
        amount: order.amountMinor,
        currency: order.currency,
        status: "captured",
      },
    },
  },
});

describe("handleWebhookEvent", () => {
  test("activates a membership when the browser never reported back", async () => {
    const order = await placeOrder();

    await handleWebhookEvent(harness.deps, capturedEvent(order));

    const [membership] = await harness.testDb.db.select().from(memberships);
    expect(membership.status).toBe("active");
    expect(harness.mail).toHaveLength(1);
  });

  test("captures and activates a payment that is only authorized", async () => {
    const order = await placeOrder();
    harness.gateway.setStatus("authorized");

    await handleWebhookEvent(harness.deps, {
      ...capturedEvent(order),
      event: "payment.authorized",
    });

    const [membership] = await harness.testDb.db.select().from(memberships);
    expect(membership.status).toBe("active");
    expect(harness.gateway.captured).toHaveLength(1);
  });

  test("ignores a repeat delivery", async () => {
    const order = await placeOrder();

    await handleWebhookEvent(harness.deps, capturedEvent(order));
    await handleWebhookEvent(harness.deps, capturedEvent(order));

    expect(harness.mail).toHaveLength(1);
  });

  test("ignores payments for other Razorpay products", async () => {
    await expect(
      handleWebhookEvent(harness.deps, {
        event: "payment.captured",
        payload: {
          payment: { entity: { id: "pay_other", order_id: null } },
        },
      })
    ).resolves.toBeUndefined();
  });

  test("ignores orders this site did not create", async () => {
    await expect(
      handleWebhookEvent(harness.deps, {
        event: "payment.captured",
        payload: {
          payment: { entity: { id: "pay_other", order_id: "order_other" } },
        },
      })
    ).resolves.toBeUndefined();
  });

  test("ignores event types it does not use", async () => {
    await expect(
      handleWebhookEvent(harness.deps, { event: "invoice.paid", payload: {} })
    ).resolves.toBeUndefined();
  });

  test("records a refund made in the Razorpay dashboard", async () => {
    const order = await placeOrder();
    await fulfilPayment(harness.deps, {
      orderId: order.orderId,
      paymentId: harness.gateway.paymentIdFor(order),
    });

    await handleWebhookEvent(harness.deps, {
      event: "refund.processed",
      payload: {
        refund: {
          entity: {
            id: "rfnd_1",
            payment_id: harness.gateway.paymentIdFor(order),
          },
        },
      },
    });

    const [payment] = await harness.testDb.db
      .select()
      .from(payments)
      .where(eq(payments.razorpayOrderId, order.orderId));
    expect(payment.status).toBe("refunded");
  });
});
