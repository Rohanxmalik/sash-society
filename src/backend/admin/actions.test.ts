import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { memberships, payments, user } from "@/backend/db/schema";
import { fulfilPayment } from "@/backend/payments/fulfil";
import { createMembershipOrder } from "@/backend/payments/orders";
import {
  addLiveMembership,
  addMember,
  createHarness,
  type Harness,
} from "@/backend/test/harness";
import {
  approveAction,
  importMembersAction,
  reinstateAction,
  rejectAction,
  removeAction,
  resendPaymentEmailAction,
  resendWelcomeAction,
} from "./actions";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getDb: vi.fn(),
  getPaymentDeps: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT ${path}`);
  }),
}));

vi.mock("@/backend/auth/session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/backend/db", () => ({ getDb: mocks.getDb }));
vi.mock("@/backend/runtime", () => ({ getPaymentDeps: mocks.getPaymentDeps }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
const CSV_HEADER =
  "name,email,phone,designation,institution,plan,member_number,joined_on,expires_on";

let harness: Harness;
const db = () => harness.testDb.db;

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  Object.entries(fields).forEach(([name, value]) => data.set(name, value));
  return data;
};

const csvForm = (content: string) => {
  const data = new FormData();
  data.set("file", new File([content], "members.csv", { type: "text/csv" }));
  return data;
};

beforeEach(async () => {
  harness = await createHarness();
  mocks.getDb.mockReturnValue(db());
  mocks.getPaymentDeps.mockReturnValue(harness.deps);
  mocks.requireAdmin.mockResolvedValue({
    user: { id: "admin", email: "admin@example.org" },
  });
  await addMember(harness);
});

afterEach(async () => {
  await harness.testDb.close();
  vi.restoreAllMocks();
});

async function payFor(planSlug: string) {
  const buyer = { id: "user-1", name: "Asha Rao", email: "user-1@example.org" };
  const result = await createMembershipOrder(harness.deps, buyer, {
    planSlug,
    declarationAccepted: true,
  });
  if (!result.ok) throw new Error(result.message);

  await fulfilPayment(harness.deps, {
    orderId: result.order.orderId,
    paymentId: harness.gateway.paymentIdFor(result.order),
  });

  const [membership] = await db().select().from(memberships);
  const [payment] = await db().select().from(payments);
  return { membership, payment };
}

describe("admin actions", () => {
  test.each([
    ["approve", approveAction],
    ["reject", rejectAction],
    ["remove", removeAction],
    ["reinstate", reinstateAction],
    ["resend welcome", resendWelcomeAction],
    ["resend payment email", resendPaymentEmailAction],
  ])("%s does nothing for a non-admin", async (_name, action) => {
    mocks.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(
      action(form({ userId: "user-1", membershipId: "m", reason: "x" }))
    ).rejects.toThrow("NEXT_REDIRECT");

    const [account] = await db().select().from(user);
    expect(account.banned).toBeFalsy();
  });

  test("import does nothing for a non-admin", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(
      importMembersAction(null, csvForm(`${CSV_HEADER}\n`))
    ).rejects.toThrow("NEXT_REDIRECT");
  });

  test("approving returns to the member page with the outcome", async () => {
    const { membership } = await payFor("ordinary");

    await expect(
      approveAction(form({ membershipId: membership.id, userId: "user-1" }))
    ).rejects.toThrow(/^REDIRECT \/admin\/members\/user-1\?notice=Approved/);

    const [approved] = await db().select().from(memberships);
    expect(approved.decidedBy).toBe("admin@example.org");
  });

  test("rejecting refunds the payment", async () => {
    const { membership } = await payFor("ordinary");

    await expect(
      rejectAction(form({ membershipId: membership.id, userId: "user-1" }))
    ).rejects.toThrow(/notice=Rejected/);

    expect(harness.gateway.refunded).toHaveLength(1);
  });

  test("removing a member needs a reason", async () => {
    await expect(
      removeAction(form({ userId: "user-1", reason: "  " }))
    ).rejects.toThrow(/REDIRECT/);

    const [account] = await db().select().from(user);
    expect(account.banned).toBeFalsy();
  });

  test("an admin cannot remove their own account", async () => {
    await addMember(harness, "admin", "admin@example.org");

    await expect(
      removeAction(form({ userId: "admin", reason: "Oops" }))
    ).rejects.toThrow(/cannot%20remove/);

    const accounts = await db().select().from(user);
    expect(accounts.every((account) => !account.banned)).toBe(true);
  });

  test("a removed member can be reinstated", async () => {
    await addLiveMembership(harness, "user-1");

    await expect(
      removeAction(form({ userId: "user-1", reason: "Conduct" }))
    ).rejects.toThrow(/REDIRECT/);
    await expect(reinstateAction(form({ userId: "user-1" }))).rejects.toThrow(
      /reinstated/
    );

    const [account] = await db().select().from(user);
    expect(account.banned).toBeFalsy();
  });

  test("the welcome email can be sent again", async () => {
    const { membership } = await payFor("student");
    const sent = harness.mail.length;

    await expect(
      resendWelcomeAction(form({ membershipId: membership.id, userId: "user-1" }))
    ).rejects.toThrow(/REDIRECT/);

    expect(harness.mail).toHaveLength(sent + 1);
  });
});

describe("resendPaymentEmailAction", () => {
  test("sends the email and returns to the page it came from", async () => {
    const { payment } = await payFor("student");
    const sent = harness.mail.length;

    await expect(
      resendPaymentEmailAction(
        form({ paymentId: payment.id, returnTo: "/admin/payments" })
      )
    ).rejects.toThrow(/^REDIRECT \/admin\/payments\?notice=Email/);

    expect(harness.mail).toHaveLength(sent + 1);
  });

  test("never redirects to another site", async () => {
    const { payment } = await payFor("student");

    await expect(
      resendPaymentEmailAction(
        form({ paymentId: payment.id, returnTo: "https://evil.example/" })
      )
    ).rejects.toThrow(/^REDIRECT \/admin\/payments\?/);
  });

  test("says so when the email fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { payment } = await payFor("student");
    mocks.getPaymentDeps.mockReturnValue({
      ...harness.deps,
      sendEmail: async () => {
        throw new Error("Resend is down");
      },
    });

    await expect(
      resendPaymentEmailAction(
        form({ paymentId: payment.id, returnTo: "/admin/payments" })
      )
    ).rejects.toThrow(/could%20not%20be%20sent/);
  });
});

describe("importMembersAction", () => {
  test("adds the members in the file", async () => {
    const row =
      "Ravi Kumar,ravi@example.org,+91 98765 43210,Professor,,student,ST-1,2026-01-15,";

    const result = await importMembersAction(
      null,
      csvForm(`${CSV_HEADER}\n${row}\n`)
    );

    expect(result).toEqual({ created: 1, problems: [] });
  });

  test("asks for a file when none was chosen", async () => {
    const result = await importMembersAction(null, new FormData());

    expect(result.problems).toEqual(["Please choose a CSV file."]);
  });

  test("refuses a file that is too large", async () => {
    const result = await importMembersAction(
      null,
      csvForm("x".repeat(MAX_IMPORT_BYTES + 1))
    );

    expect(result.problems).toEqual(["This file is too large."]);
  });
});
