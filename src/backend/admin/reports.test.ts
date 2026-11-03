import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { parseCsv } from "@/backend/csv";
import { placeholderEmail } from "@/shared/no-email";
import { fulfilPayment } from "@/backend/payments/fulfil";
import { createEventOrder, createMembershipOrder } from "@/backend/payments/orders";
import {
  addMember,
  createHarness,
  NOW,
  type Harness,
} from "@/backend/test/harness";
import {
  getOverview,
  listPayments,
  listRegistrations,
  membersCsv,
  paymentsCsv,
  registrationsCsv,
} from "./reports";

let harness: Harness;
const db = () => harness.testDb.db;

beforeEach(async () => {
  harness = await createHarness();
});

afterEach(async () => {
  await harness.testDb.close();
});

async function pay(order: {
  orderId: string;
  amountMinor: number;
  currency: string;
}) {
  await fulfilPayment(harness.deps, {
    orderId: order.orderId,
    paymentId: harness.gateway.paymentIdFor(order),
  });
}

async function joinPlan(planSlug: string, userId: string) {
  const member = await addMember(harness, userId);
  const result = await createMembershipOrder(harness.deps, member, {
    planSlug,
    declarationAccepted: true,
  });
  if (!result.ok) throw new Error(result.message);
  await pay(result.order);
}

async function register(email: string, optionId = "offline") {
  const result = await createEventOrder(
    harness.deps,
    {
      eventId: "mauritius-2027",
      optionId,
      fullName: "Asha Rao",
      email,
      whatsapp: "+91 98765 43210",
      affiliation: "University of Delhi",
      designation: "Assistant Professor",
      paperTitle: "AI and caste",
    },
    null
  );
  if (!result.ok) throw new Error(result.message);
  return result.order;
}

describe("getOverview", () => {
  test("counts members, approvals, registrations and money", async () => {
    await joinPlan("student", "user-1");
    await joinPlan("ordinary", "user-2");
    await pay(await register("a@example.org"));

    expect(await getOverview(db(), NOW)).toMatchObject({
      accounts: 2,
      activeMembers: 1,
      pendingApprovals: 1,
      confirmedRegistrations: 1,
      revenue: [{ currency: "INR", amountMinor: 650000 }],
    });
  });

  test("leaves out money that was never paid", async () => {
    await register("a@example.org");

    expect((await getOverview(db(), NOW)).revenue).toEqual([]);
  });
});

describe("listRegistrations", () => {
  test("lists confirmed people with what they paid", async () => {
    await pay(await register("a@example.org"));

    const [row] = await listRegistrations(db(), "mauritius-2027");

    expect(row).toMatchObject({
      email: "a@example.org",
      optionId: "offline",
      paperTitle: "AI and caste",
      amountMinor: 500000,
      registrationNumber: "SASS/MU27/0001",
    });
  });

  test("leaves out abandoned payments", async () => {
    await register("a@example.org");

    expect(await listRegistrations(db(), "mauritius-2027")).toHaveLength(0);
  });

  test("keeps events separate", async () => {
    await pay(await register("a@example.org"));

    expect(await listRegistrations(db(), "other-event")).toHaveLength(0);
  });
});

describe("listPayments", () => {
  test("includes every completed payment, newest first", async () => {
    await joinPlan("student", "user-1");
    await pay(await register("a@example.org"));

    const rows = await listPayments(db());

    expect(rows).toHaveLength(2);
  });

  test("leaves out orders nobody paid", async () => {
    await register("a@example.org");

    expect(await listPayments(db())).toHaveLength(0);
  });
});

describe("csv exports", () => {
  test("members export has a row for each person", async () => {
    await joinPlan("student", "user-1");

    const [header, row] = parseCsv(await membersCsv(db(), NOW));

    expect(header).toContain("Email");
    expect(header).toContain("Member number");
    expect(row).toContain("user-1@example.org");
    expect(row).toContain("Student Membership");
    expect(row).toContain("active");
  });

  test("the members export leaves the email blank when there is none", async () => {
    await addMember(harness, "user-9", placeholderEmail("abc"));

    const csv = await membersCsv(db(), NOW);

    expect(csv).not.toContain(placeholderEmail("abc"));
  });

  test("event export is ready for the organisers", async () => {
    await pay(await register("a@example.org"));

    const [header, row] = parseCsv(
      await registrationsCsv(db(), "mauritius-2027")
    );

    expect(header).toContain("WhatsApp");
    expect(row).toContain("a@example.org");
    expect(row).toContain("Offline (in person, Mauritius)");
    expect(row).toContain("INR 5,000.00");
  });

  test("payments export shows the Razorpay reference", async () => {
    await joinPlan("student", "user-1");

    const rows = parseCsv(await paymentsCsv(db()));

    expect(rows).toHaveLength(2);
    expect(rows[1].join(" ")).toContain("pay_fake");
  });

  test("a formula typed into a profile cannot run in Excel", async () => {
    await pay(await register("a@example.org"));
    const { eventRegistrations } = await import("@/backend/db/schema");
    await db()
      .update(eventRegistrations)
      .set({ affiliation: '=HYPERLINK("http://evil.example","Click")' });

    const csv = await registrationsCsv(db(), "mauritius-2027");

    expect(csv).toContain("'=HYPERLINK");
  });
});
