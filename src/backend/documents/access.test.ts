import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { memberships, payments } from "@/backend/db/schema";
import { fulfilPayment } from "@/backend/payments/fulfil";
import {
  createEventOrder,
  createMembershipOrder,
} from "@/backend/payments/orders";
import {
  addLiveMembership,
  addMember,
  createHarness,
  type Harness,
} from "@/backend/test/harness";
import { certificateResponse, receiptResponse } from "./access";

const ADMIN_EMAIL = "admin@example.org";

const mocks = vi.hoisted(() => ({
  requireSession: vi.fn(),
  getDb: vi.fn(),
}));

vi.mock("@/backend/auth/session", () => ({
  requireSession: mocks.requireSession,
  isAdminEmail: (email: string) => email === "admin@example.org",
}));
vi.mock("@/backend/db", () => ({ getDb: mocks.getDb }));

let harness: Harness;

const signInAs = (id: string, email = `${id}@example.org`) =>
  mocks.requireSession.mockResolvedValue({ user: { id, email } });

beforeEach(async () => {
  harness = await createHarness();
  mocks.getDb.mockReturnValue(harness.testDb.db);
  await addMember(harness, "owner");
  signInAs("owner");
});

afterEach(async () => {
  await harness.testDb.close();
});

async function paidMembership() {
  const buyer = { id: "owner", name: "Asha Rao", email: "owner@example.org" };
  const result = await createMembershipOrder(harness.deps, buyer, {
    planSlug: "student",
    declarationAccepted: true,
  });
  if (!result.ok) throw new Error(result.message);

  await fulfilPayment(harness.deps, {
    orderId: result.order.orderId,
    paymentId: harness.gateway.paymentIdFor(result.order),
  });

  const [payment] = await harness.testDb.db.select().from(payments);
  const [membership] = await harness.testDb.db.select().from(memberships);
  return { payment, membership };
}

describe("certificateResponse", () => {
  test("gives the owner a private PDF", async () => {
    const { membership } = await paidMembership();

    const response = await certificateResponse(membership.id);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  test("gives an admin any member's certificate", async () => {
    const { membership } = await paidMembership();
    signInAs("someone", ADMIN_EMAIL);

    expect((await certificateResponse(membership.id)).status).toBe(200);
  });

  test("hides a certificate from another member", async () => {
    const { membership } = await paidMembership();
    signInAs("stranger");

    expect((await certificateResponse(membership.id)).status).toBe(404);
  });

  test("gives nothing for a membership that is not active", async () => {
    const pending = await addLiveMembership(harness, "owner", {
      status: "pending_approval",
    });

    expect((await certificateResponse(pending.id)).status).toBe(404);
  });

  test("gives nothing for an id that does not exist", async () => {
    expect((await certificateResponse("no-such-id")).status).toBe(404);
  });
});

describe("receiptResponse", () => {
  test("gives the owner a PDF", async () => {
    const { payment } = await paidMembership();

    const response = await receiptResponse(payment.id);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toContain(".pdf");
  });

  test("gives an admin any receipt", async () => {
    const { payment } = await paidMembership();
    signInAs("someone", ADMIN_EMAIL);

    expect((await receiptResponse(payment.id)).status).toBe(200);
  });

  test("hides a receipt from another member", async () => {
    const { payment } = await paidMembership();
    signInAs("stranger");

    expect((await receiptResponse(payment.id)).status).toBe(404);
  });

  test("gives nothing for a payment that was never completed", async () => {
    const buyer = { id: "owner", name: "Asha Rao", email: "owner@example.org" };
    await createMembershipOrder(harness.deps, buyer, {
      planSlug: "student",
      declarationAccepted: true,
    });
    const [payment] = await harness.testDb.db.select().from(payments);

    expect((await receiptResponse(payment.id)).status).toBe(404);
  });

  test("keeps a guest's receipt away from members", async () => {
    const result = await createEventOrder(
      harness.deps,
      {
        eventId: "mauritius-2027",
        optionId: "online",
        fullName: "Asha Rao",
        email: "guest@example.org",
        whatsapp: "+91 98765 43210",
        affiliation: "University of Delhi",
        designation: "Assistant Professor",
      },
      null
    );
    if (!result.ok) throw new Error(result.message);
    await fulfilPayment(harness.deps, {
      orderId: result.order.orderId,
      paymentId: harness.gateway.paymentIdFor(result.order),
    });
    const [payment] = await harness.testDb.db.select().from(payments);

    expect((await receiptResponse(payment.id)).status).toBe(404);
  });

  test("gives nothing for an id that does not exist", async () => {
    expect((await receiptResponse("no-such-id")).status).toBe(404);
  });
});
