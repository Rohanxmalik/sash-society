import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { eventRegistrations, payments } from "@/backend/db/schema";
import {
  addLiveMembership,
  addMember,
  createHarness,
  NOW,
  type Harness,
} from "@/backend/test/harness";
import { createEventOrder, createMembershipOrder } from "./orders";

let harness: Harness;

beforeEach(async () => {
  harness = await createHarness();
});

afterEach(async () => {
  await harness.testDb.close();
});

const REGISTRATION = {
  eventId: "mauritius-2027",
  optionId: "offline",
  fullName: "Asha Rao",
  email: "asha@example.org",
  whatsapp: "+91 98765 43210",
  affiliation: "University of Delhi",
  designation: "Assistant Professor",
};

const allPayments = () => harness.testDb.db.select().from(payments);

describe("createMembershipOrder", () => {
  const order = async (input: Record<string, unknown>) => {
    const member = await addMember(harness);
    return createMembershipOrder(harness.deps, member, input);
  };

  const CHECKOUT = { planSlug: "student", declarationAccepted: true };

  test("charges the plan's price from the server", async () => {
    const result = await order({ ...CHECKOUT, amountMinor: 1 });

    expect(result).toMatchObject({
      ok: true,
      order: { amountMinor: 50000, currency: "INR", provider: "fake" },
    });
    const [payment] = await allPayments();
    expect(payment).toMatchObject({
      purpose: "membership",
      status: "created",
      amountMinor: 50000,
      planSlug: "student",
      userId: "user-1",
    });
    expect(payment.declarationAcceptedAt).toEqual(NOW);
  });

  test("uses the plan's own currency", async () => {
    const result = await order({ ...CHECKOUT, planSlug: "life-abroad" });

    expect(result).toMatchObject({
      ok: true,
      order: { amountMinor: 30000, currency: "USD" },
    });
  });

  test("prefills the member's phone for the payment popup", async () => {
    const result = await order(CHECKOUT);

    expect(result).toMatchObject({
      ok: true,
      order: { prefill: { contact: "+91 98765 43210" } },
    });
  });

  test("rejects an unknown plan", async () => {
    const result = await order({ ...CHECKOUT, planSlug: "free-forever" });

    expect(result.ok).toBe(false);
    expect(await allPayments()).toHaveLength(0);
  });

  test("requires the eligibility declaration", async () => {
    const result = await order({ planSlug: "student" });

    expect(result.ok).toBe(false);
    expect(await allPayments()).toHaveLength(0);
  });

  test("requires an organisation name on organisation plans", async () => {
    const result = await order({ ...CHECKOUT, planSlug: "institutional" });

    expect(result.ok).toBe(false);
  });

  test("keeps the organisation name for the certificate", async () => {
    await order({
      ...CHECKOUT,
      planSlug: "institutional",
      organisationName: "Delhi Sociology Forum",
    });

    expect((await allPayments())[0].organisationName).toBe(
      "Delhi Sociology Forum"
    );
  });

  test("ignores an organisation name on a personal plan", async () => {
    await order({
      ...CHECKOUT,
      planSlug: "student",
      organisationName: "Delhi Sociology Forum",
    });

    expect((await allPayments())[0].organisationName).toBeNull();
  });

  test("blocks a second membership while one is live", async () => {
    const member = await addMember(harness);
    await addLiveMembership(harness, member.id);

    const result = await createMembershipOrder(harness.deps, member, CHECKOUT);

    expect(result).toEqual({
      ok: false,
      message: "You already have a membership.",
    });
  });

  test("lets a member renew once their membership has lapsed", async () => {
    const member = await addMember(harness);
    await addLiveMembership(harness, member.id, {
      expiresAt: new Date("2026-01-01T00:00:00Z"),
    });

    const result = await createMembershipOrder(harness.deps, member, CHECKOUT);

    expect(result.ok).toBe(true);
  });
});

describe("createEventOrder", () => {
  test("charges the option's price and holds the registration", async () => {
    const result = await createEventOrder(harness.deps, REGISTRATION, null);

    expect(result).toMatchObject({
      ok: true,
      order: { amountMinor: 500000, currency: "INR" },
    });
    const [registration] = await harness.testDb.db
      .select()
      .from(eventRegistrations);
    expect(registration).toMatchObject({
      status: "pending_payment",
      eventId: "mauritius-2027",
      optionId: "offline",
    });
    const [payment] = await allPayments();
    expect(payment).toMatchObject({
      purpose: "event",
      eventRegistrationId: registration.id,
      amountMinor: 500000,
      userId: null,
    });
  });

  test("links the registration to a logged-in member", async () => {
    await addMember(harness);

    await createEventOrder(harness.deps, REGISTRATION, "user-1");

    const [registration] = await harness.testDb.db
      .select()
      .from(eventRegistrations);
    expect(registration.userId).toBe("user-1");
  });

  test("refuses an option past its closing date", async () => {
    const late = {
      ...harness.deps,
      now: () => new Date("2026-11-26T00:00:00Z"),
    };

    const result = await createEventOrder(late, REGISTRATION, null);

    expect(result.ok).toBe(false);
    expect(await allPayments()).toHaveLength(0);
  });

  test("refuses an unknown event", async () => {
    const result = await createEventOrder(
      harness.deps,
      { ...REGISTRATION, eventId: "nope" },
      null
    );

    expect(result.ok).toBe(false);
  });

  test("refuses invalid input", async () => {
    const result = await createEventOrder(
      harness.deps,
      { ...REGISTRATION, email: "bad" },
      null
    );

    expect(result.ok).toBe(false);
  });

  test("stops an email registering for the same event twice", async () => {
    await createEventOrder(harness.deps, REGISTRATION, null);
    await harness.testDb.db
      .update(eventRegistrations)
      .set({ status: "confirmed" })
      .where(eq(eventRegistrations.email, "asha@example.org"));

    const result = await createEventOrder(
      harness.deps,
      { ...REGISTRATION, email: "ASHA@example.org" },
      null
    );

    expect(result).toEqual({
      ok: false,
      message: "This email is already registered for this event.",
    });
  });

  test("lets someone retry after abandoning the payment popup", async () => {
    await createEventOrder(harness.deps, REGISTRATION, null);

    const result = await createEventOrder(harness.deps, REGISTRATION, null);

    expect(result.ok).toBe(true);
  });
});
