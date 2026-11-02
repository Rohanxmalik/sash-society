import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { eventRegistrations, memberships, payments } from "@/backend/db/schema";
import {
  addLiveMembership,
  addMember,
  createHarness,
  type Harness,
} from "@/backend/test/harness";
import { confirmPayment, fulfilPayment } from "./fulfil";
import { createEventOrder, createMembershipOrder } from "./orders";

let harness: Harness;

beforeEach(async () => {
  harness = await createHarness();
});

afterEach(async () => {
  await harness.testDb.close();
  vi.restoreAllMocks();
});

async function placeMembershipOrder(planSlug = "student", userId = "user-1") {
  const member = await addMember(harness, userId);
  const result = await createMembershipOrder(harness.deps, member, {
    planSlug,
    declarationAccepted: true,
    organisationName: planSlug === "institutional" ? "Delhi Forum" : undefined,
  });
  if (!result.ok) throw new Error(result.message);
  return result.order;
}

async function placeEventOrder() {
  const result = await createEventOrder(
    harness.deps,
    {
      eventId: "mauritius-2027",
      optionId: "online",
      fullName: "Asha Rao",
      email: "asha@example.org",
      whatsapp: "+91 98765 43210",
      affiliation: "University of Delhi",
      designation: "Assistant Professor",
    },
    null
  );
  if (!result.ok) throw new Error(result.message);
  return result.order;
}

const pay = (order: { orderId: string; amountMinor: number; currency: string }) =>
  fulfilPayment(harness.deps, {
    orderId: order.orderId,
    paymentId: harness.gateway.paymentIdFor(order),
  });

const paymentRow = async (orderId: string) => {
  const [row] = await harness.testDb.db
    .select()
    .from(payments)
    .where(eq(payments.razorpayOrderId, orderId));
  return row;
};

const allMemberships = () => harness.testDb.db.select().from(memberships);

describe("paying for a membership", () => {
  test("activates the membership with a number and expiry", async () => {
    const order = await placeMembershipOrder();

    expect(await pay(order)).toBe("active");

    const [membership] = await allMemberships();
    expect(membership).toMatchObject({
      status: "active",
      planSlug: "student",
      memberNumber: "SASS/ST/2026/0001",
    });
    expect(membership.expiresAt?.toISOString()).toBe("2027-11-09T18:29:59.000Z");
  });

  test("marks the payment paid and gives it a receipt number", async () => {
    const order = await placeMembershipOrder();

    await pay(order);

    expect(await paymentRow(order.orderId)).toMatchObject({
      status: "paid",
      receiptNumber: "SASS/R/2026-27/0001",
      razorpayPaymentId: harness.gateway.paymentIdFor(order),
    });
  });

  test("emails the invoice and certificate", async () => {
    const order = await placeMembershipOrder();

    await pay(order);

    expect(harness.mail).toHaveLength(1);
    expect(harness.mail[0].to).toBe("user-1@example.org");
    expect(harness.mail[0].attachments?.map((file) => file.filename)).toEqual([
      "SASS-receipt.pdf",
      "SASS-membership-certificate.pdf",
    ]);
    expect((await paymentRow(order.orderId)).emailSentAt).not.toBeNull();
  });

  test("runs once when the browser and webhook both report it", async () => {
    const order = await placeMembershipOrder();

    await Promise.all([pay(order), pay(order)]);
    await pay(order);

    expect(await allMemberships()).toHaveLength(1);
    expect(harness.mail).toHaveLength(1);
  });

  test("holds approval plans back from the certificate", async () => {
    const order = await placeMembershipOrder("ordinary");

    expect(await pay(order)).toBe("pending_approval");

    const [membership] = await allMemberships();
    expect(membership).toMatchObject({
      status: "pending_approval",
      memberNumber: null,
    });
    expect(harness.mail[0].attachments?.map((file) => file.filename)).toEqual([
      "SASS-receipt.pdf",
    ]);
  });

  test("records the organisation name", async () => {
    const order = await placeMembershipOrder("institutional");

    await pay(order);

    expect((await allMemberships())[0].organisationName).toBe("Delhi Forum");
  });

  test("replaces a lapsed membership when renewing", async () => {
    const member = await addMember(harness);
    await addLiveMembership(harness, member.id, {
      expiresAt: new Date("2026-01-01T00:00:00Z"),
    });
    const result = await createMembershipOrder(harness.deps, member, {
      planSlug: "student",
      declarationAccepted: true,
    });
    if (!result.ok) throw new Error(result.message);

    await pay(result.order);

    const rows = await allMemberships();
    expect(rows.map((row) => row.status).sort()).toEqual(["active", "expired"]);
  });

  test("flags a second payment instead of losing it", async () => {
    const member = await addMember(harness);
    const first = await createMembershipOrder(harness.deps, member, {
      planSlug: "student",
      declarationAccepted: true,
    });
    const second = await createMembershipOrder(harness.deps, member, {
      planSlug: "individual",
      declarationAccepted: true,
    });
    if (!first.ok || !second.ok) throw new Error("order failed");
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});

    await pay(first.order);
    await pay(second.order);

    expect(await allMemberships()).toHaveLength(1);
    const payment = await paymentRow(second.order.orderId);
    expect(payment.status).toBe("paid");
    expect(payment.note).toContain("refund");
    expect(logged).toHaveBeenCalled();
  });
});

describe("paying for an event", () => {
  test("confirms the registration with a number", async () => {
    const order = await placeEventOrder();

    expect(await pay(order)).toBe("registered");

    const [registration] = await harness.testDb.db
      .select()
      .from(eventRegistrations);
    expect(registration).toMatchObject({
      status: "confirmed",
      registrationNumber: "SASS/MU27/0001",
    });
  });

  test("emails the invoice to the registrant", async () => {
    const order = await placeEventOrder();

    await pay(order);

    expect(harness.mail[0].to).toBe("asha@example.org");
    expect(harness.mail[0].attachments?.map((file) => file.filename)).toEqual([
      "SASS-receipt.pdf",
    ]);
  });

  test("flags a duplicate registration for a refund", async () => {
    const first = await placeEventOrder();
    const second = await placeEventOrder();
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});

    await pay(first);
    await pay(second);

    const confirmed = await harness.testDb.db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.status, "confirmed"));
    expect(confirmed).toHaveLength(1);
    expect((await paymentRow(second.orderId)).note).toContain("refund");
    expect(logged).toHaveBeenCalled();
  });
});

describe("checking with Razorpay first", () => {
  test("captures a payment that is only authorized", async () => {
    const order = await placeMembershipOrder();
    harness.gateway.setStatus("authorized");

    await pay(order);

    expect(harness.gateway.captured).toEqual([
      {
        paymentId: harness.gateway.paymentIdFor(order),
        amountMinor: 50000,
        currency: "INR",
      },
    ]);
    expect((await allMemberships())[0].status).toBe("active");
  });

  test("carries on when Razorpay's own capture got there first", async () => {
    const order = await placeMembershipOrder();
    harness.gateway.setStatus("authorized");
    const deps = {
      ...harness.deps,
      gateway: {
        ...harness.deps.gateway,
        capturePayment: async () => {
          harness.gateway.setStatus("captured");
          throw new Error("This payment has already been captured");
        },
      },
    };

    await fulfilPayment(deps, {
      orderId: order.orderId,
      paymentId: harness.gateway.paymentIdFor(order),
    });

    expect((await allMemberships())[0].status).toBe("active");
  });

  test("still fails when a capture really did not happen", async () => {
    const order = await placeMembershipOrder();
    harness.gateway.setStatus("authorized");
    const deps = {
      ...harness.deps,
      gateway: {
        ...harness.deps.gateway,
        capturePayment: async () => {
          throw new Error("Razorpay is down");
        },
      },
    };

    await expect(
      fulfilPayment(deps, {
        orderId: order.orderId,
        paymentId: harness.gateway.paymentIdFor(order),
      })
    ).rejects.toThrow("Razorpay is down");
    expect(await allMemberships()).toHaveLength(0);
  });

  test("does nothing for a failed payment", async () => {
    const order = await placeMembershipOrder();
    harness.gateway.setStatus("failed");

    await expect(pay(order)).rejects.toThrow("not complete");

    expect(await allMemberships()).toHaveLength(0);
    expect((await paymentRow(order.orderId)).status).toBe("created");
  });

  test("refuses a payment for a smaller amount", async () => {
    const order = await placeMembershipOrder();
    const paymentId = harness.gateway.paymentIdFor({
      ...order,
      amountMinor: 100,
    });

    await expect(
      fulfilPayment(harness.deps, { orderId: order.orderId, paymentId })
    ).rejects.toThrow("does not match");

    expect(await allMemberships()).toHaveLength(0);
  });

  test("refuses a payment made against another order", async () => {
    const order = await placeMembershipOrder();
    const paymentId = harness.gateway.paymentIdFor({
      ...order,
      orderId: "order_other",
    });

    await expect(
      fulfilPayment(harness.deps, { orderId: order.orderId, paymentId })
    ).rejects.toThrow("does not match");
  });

  test("refuses an order we never created", async () => {
    await expect(
      fulfilPayment(harness.deps, { orderId: "order_x", paymentId: "pay_x" })
    ).rejects.toThrow("Unknown order");
  });
});

describe("when email fails", () => {
  test("the membership still activates and stays marked unsent", async () => {
    const order = await placeMembershipOrder();
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    harness.deps.sendEmail = async () => {
      throw new Error("Resend is down");
    };

    expect(await pay(order)).toBe("active");

    expect((await allMemberships())[0].status).toBe("active");
    expect((await paymentRow(order.orderId)).emailSentAt).toBeNull();
    expect(logged).toHaveBeenCalled();
  });
});

describe("confirmPayment", () => {
  test("accepts a genuine checkout response", async () => {
    const order = await placeMembershipOrder();

    const result = await confirmPayment(
      harness.deps,
      harness.gateway.checkoutResponse(order)
    );

    expect(result).toEqual({ ok: true, outcome: "active" });
  });

  test("rejects a forged signature", async () => {
    const order = await placeMembershipOrder();

    const result = await confirmPayment(harness.deps, {
      ...harness.gateway.checkoutResponse(order),
      signature: "0".repeat(64),
    });

    expect(result.ok).toBe(false);
    expect(await allMemberships()).toHaveLength(0);
  });

  test("rejects malformed input", async () => {
    const result = await confirmPayment(harness.deps, { orderId: 1 });

    expect(result.ok).toBe(false);
  });
});
