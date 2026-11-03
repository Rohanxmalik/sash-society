import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { memberships, payments, session, user } from "@/backend/db/schema";
import { fulfilPayment } from "@/backend/payments/fulfil";
import { hasRealEmail, placeholderEmail } from "@/shared/no-email";
import { createMembershipOrder } from "@/backend/payments/orders";
import {
  addLiveMembership,
  addMember,
  createHarness,
  NOW,
  type Harness,
} from "@/backend/test/harness";
import {
  approveMembership,
  getMemberDetail,
  listMembers,
  reinstateMember,
  rejectMembership,
  removeMember,
  resendWelcomeEmail,
  updateMemberEmail,
} from "./members";

const ADMIN = "admin@example.org";

let harness: Harness;
const db = () => harness.testDb.db;

beforeEach(async () => {
  harness = await createHarness();
});

afterEach(async () => {
  await harness.testDb.close();
  vi.restoreAllMocks();
});

async function paidApplication(planSlug = "ordinary") {
  const member = await addMember(harness);
  const result = await createMembershipOrder(harness.deps, member, {
    planSlug,
    declarationAccepted: true,
  });
  if (!result.ok) throw new Error(result.message);
  await fulfilPayment(harness.deps, {
    orderId: result.order.orderId,
    paymentId: harness.gateway.paymentIdFor(result.order),
  });
  harness.mail.length = 0;
  const [membership] = await db().select().from(memberships);
  return membership;
}

const onlyMembership = async () => (await db().select().from(memberships))[0];
const onlyPayment = async () => (await db().select().from(payments))[0];

describe("approveMembership", () => {
  test("activates the application and numbers it", async () => {
    const application = await paidApplication();

    const result = await approveMembership(harness.deps, application.id, ADMIN);

    expect(result.ok).toBe(true);
    expect(await onlyMembership()).toMatchObject({
      status: "active",
      memberNumber: "SASS/OM/2026/0001",
      decidedBy: ADMIN,
    });
  });

  test("starts the membership on the approval date", async () => {
    const application = await paidApplication();

    await approveMembership(harness.deps, application.id, ADMIN);

    expect((await onlyMembership()).startsAt).toEqual(NOW);
  });

  test("emails the certificate and receipt", async () => {
    const application = await paidApplication();

    await approveMembership(harness.deps, application.id, ADMIN);

    expect(harness.mail[0].attachments?.map((file) => file.filename)).toEqual([
      "SASS-receipt.pdf",
      "SASS-membership-certificate.pdf",
    ]);
  });

  test("refuses anything that is not waiting for approval", async () => {
    const application = await paidApplication("student");

    const result = await approveMembership(harness.deps, application.id, ADMIN);

    expect(result.ok).toBe(false);
  });

  test("stays approved when the email fails, and says so", async () => {
    const application = await paidApplication();
    vi.spyOn(console, "error").mockImplementation(() => {});
    harness.deps.sendEmail = async () => {
      throw new Error("Resend is down");
    };

    const result = await approveMembership(harness.deps, application.id, ADMIN);

    expect(result).toEqual({
      ok: true,
      message: "Approved, but the email failed. Use Resend.",
    });
    expect((await onlyMembership()).status).toBe("active");
  });
});

describe("rejectMembership", () => {
  test("rejects, refunds and tells the applicant", async () => {
    const application = await paidApplication();

    await rejectMembership(harness.deps, application.id, ADMIN);

    expect((await onlyMembership()).status).toBe("rejected");
    expect(harness.gateway.refunded).toHaveLength(1);
    expect((await onlyPayment()).status).toBe("refunded");
    expect(harness.mail[0].text).toContain("has been refunded");
  });

  test("flags a refund that failed instead of hiding it", async () => {
    const application = await paidApplication();
    vi.spyOn(console, "error").mockImplementation(() => {});
    harness.deps.gateway = {
      ...harness.deps.gateway,
      refundPayment: async () => {
        throw new Error("Razorpay request failed: not enough balance");
      },
    };

    const result = await rejectMembership(harness.deps, application.id, ADMIN);

    expect(result).toEqual({
      ok: true,
      message: "Rejected, but the refund failed. Refund it in Razorpay.",
    });
    expect((await onlyPayment()).status).toBe("paid");
    expect(harness.mail[0].text).not.toContain("has been refunded");
  });

  test("refuses an active membership", async () => {
    const application = await paidApplication("student");

    const result = await rejectMembership(harness.deps, application.id, ADMIN);

    expect(result.ok).toBe(false);
    expect(harness.gateway.refunded).toHaveLength(0);
  });
});

describe("removeMember", () => {
  async function activeMemberWithSession() {
    const member = await addMember(harness);
    await addLiveMembership(harness, member.id);
    await db().insert(session).values({
      id: "session-1",
      token: "token-1",
      userId: member.id,
      expiresAt: new Date("2027-01-01T00:00:00Z"),
      updatedAt: NOW,
    });
    return member;
  }

  test("ends the membership and keeps the reason", async () => {
    const member = await activeMemberWithSession();

    await removeMember(harness.deps, member.id, "Fraudulent degree", ADMIN);

    expect(await onlyMembership()).toMatchObject({
      status: "removed",
      removedReason: "Fraudulent degree",
      decidedBy: ADMIN,
    });
  });

  test("blocks login and logs them out at once", async () => {
    const member = await activeMemberWithSession();

    await removeMember(harness.deps, member.id, "Fraudulent degree", ADMIN);

    const [row] = await db().select().from(user).where(eq(user.id, member.id));
    expect(row.banned).toBe(true);
    expect(await db().select().from(session)).toHaveLength(0);
  });

  test("keeps payment records for the accounts", async () => {
    await paidApplication("student");
    const [{ id }] = await db().select().from(user);

    await removeMember(harness.deps, id, "Fraudulent degree", ADMIN);

    expect(await db().select().from(payments)).toHaveLength(1);
  });

  test("needs a reason", async () => {
    const member = await activeMemberWithSession();

    const result = await removeMember(harness.deps, member.id, "   ", ADMIN);

    expect(result.ok).toBe(false);
    expect((await onlyMembership()).status).toBe("active");
  });

  test("leaves other members alone", async () => {
    const member = await activeMemberWithSession();
    const other = await addMember(harness, "user-2");
    await addLiveMembership(harness, other.id);

    await removeMember(harness.deps, member.id, "Reason", ADMIN);

    const [row] = await db()
      .select()
      .from(memberships)
      .where(eq(memberships.userId, other.id));
    expect(row.status).toBe("active");
  });
});

describe("reinstateMember", () => {
  test("restores an active member", async () => {
    const member = await addMember(harness);
    await addLiveMembership(harness, member.id, { memberNumber: "SASS/ST/2026/0007" });
    await removeMember(harness.deps, member.id, "Mistake", ADMIN);

    await reinstateMember(harness.deps, member.id);

    expect(await onlyMembership()).toMatchObject({
      status: "active",
      memberNumber: "SASS/ST/2026/0007",
      removedReason: null,
    });
    const [row] = await db().select().from(user).where(eq(user.id, member.id));
    expect(row.banned).toBe(false);
  });

  test("puts an unapproved application back in the queue", async () => {
    const application = await paidApplication();
    await removeMember(harness.deps, application.userId, "Mistake", ADMIN);

    await reinstateMember(harness.deps, application.userId);

    expect((await onlyMembership()).status).toBe("pending_approval");
  });
});

describe("resendWelcomeEmail", () => {
  test("sends the certificate again", async () => {
    const membership = await paidApplication("student");

    const result = await resendWelcomeEmail(harness.deps, membership.id);

    expect(result.ok).toBe(true);
    expect(harness.mail).toHaveLength(1);
  });

  test("refuses a membership that is not active", async () => {
    const membership = await paidApplication();

    const result = await resendWelcomeEmail(harness.deps, membership.id);

    expect(result.ok).toBe(false);
  });
});

describe("listMembers", () => {
  beforeEach(async () => {
    await addMember(harness, "asha", "asha@example.org");
    await addMember(harness, "bilal", "bilal@example.org");
    await db().update(user).set({ name: "Bilal Khan" }).where(eq(user.id, "bilal"));
    await addLiveMembership(harness, "asha", {
      planSlug: "life-india",
      memberNumber: "SASS/LM/2026/0001",
      expiresAt: null,
    });
  });

  const ids = async (filters = {}) =>
    (await listMembers(db(), filters, NOW)).rows.map((row) => row.id).sort();

  test("includes people who have not bought a plan", async () => {
    expect(await ids()).toEqual(["asha", "bilal"]);
  });

  test("searches by name", async () => {
    expect(await ids({ q: "bilal" })).toEqual(["bilal"]);
  });

  test("searches by email", async () => {
    expect(await ids({ q: "asha@" })).toEqual(["asha"]);
  });

  test("searches by member number", async () => {
    expect(await ids({ q: "LM/2026" })).toEqual(["asha"]);
  });

  test("filters by plan", async () => {
    expect(await ids({ plan: "life-india" })).toEqual(["asha"]);
  });

  test("filters by status", async () => {
    expect(await ids({ status: "active" })).toEqual(["asha"]);
  });

  test("filters people with no membership", async () => {
    expect(await ids({ status: "none" })).toEqual(["bilal"]);
  });

  test("shows the newest membership for someone who renewed", async () => {
    await db()
      .update(memberships)
      .set({ status: "expired", createdAt: new Date("2025-01-01T00:00:00Z") })
      .where(eq(memberships.userId, "asha"));
    await addLiveMembership(harness, "asha", { planSlug: "student" });

    const { rows } = await listMembers(db(), { q: "asha" }, NOW);

    expect(rows).toHaveLength(1);
    expect(rows[0].planSlug).toBe("student");
  });

  test("reports a lapsed membership as expired", async () => {
    await db()
      .update(memberships)
      .set({ expiresAt: new Date("2026-01-01T00:00:00Z") })
      .where(eq(memberships.userId, "asha"));

    const { rows } = await listMembers(db(), { q: "asha" }, NOW);

    expect(rows[0].status).toBe("expired");
  });

  test("counts every match while returning one page", async () => {
    const { rows, total } = await listMembers(db(), { pageSize: 1 }, NOW);

    expect(rows).toHaveLength(1);
    expect(total).toBe(2);
  });
});

describe("updateMemberEmail", () => {
  beforeEach(async () => {
    await addMember(harness, "user-1", placeholderEmail("abc"));
    await addMember(harness, "user-2");
  });

  const emailOf = async (id: string) =>
    (await getMemberDetail(db(), id))?.email;

  test("gives a member a real address", async () => {
    const result = await updateMemberEmail(db(), "user-1", "Asha@Example.org");

    expect(result.ok).toBe(true);
    expect(await emailOf("user-1")).toBe("asha@example.org");
  });

  test("refuses an address that is not an email", async () => {
    const result = await updateMemberEmail(db(), "user-1", "not an email");

    expect(result.ok).toBe(false);
    expect(hasRealEmail((await emailOf("user-1")) ?? "")).toBe(false);
  });

  test("refuses an address another member already uses", async () => {
    const result = await updateMemberEmail(db(), "user-1", "user-2@example.org");

    expect(result.ok).toBe(false);
    expect(result.message).toContain("already");
  });

  test("reports an unknown member", async () => {
    const result = await updateMemberEmail(db(), "nobody", "a@example.org");

    expect(result.ok).toBe(false);
  });
});

describe("getMemberDetail", () => {
  test("gathers the profile, memberships and payments", async () => {
    await paidApplication("student");

    const detail = await getMemberDetail(db(), "user-1");

    expect(detail?.email).toBe("user-1@example.org");
    expect(detail?.profile?.designation).toBe("Assistant Professor");
    expect(detail?.memberships).toHaveLength(1);
    expect(detail?.payments).toHaveLength(1);
  });

  test("returns nothing for an unknown member", async () => {
    expect(await getMemberDetail(db(), "nobody")).toBeNull();
  });
});
