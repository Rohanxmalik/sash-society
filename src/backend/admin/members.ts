import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import {
  eventRegistrations,
  memberships,
  payments,
  profiles,
  session,
  user,
} from "@/backend/db/schema";
import type { Db } from "@/backend/db/types";
import { findMemberContact } from "@/backend/documents/load";
import { membershipRejectedEmail } from "@/backend/email/templates";
import { activationFields } from "@/backend/members/activation";
import {
  findMembership,
  findPaymentForMembership,
  type Membership,
} from "@/backend/members/repository";
import type { PaymentDeps } from "@/backend/payments/deps";
import { welcomeEmailFor } from "@/backend/payments/notify";
import { safeLogValue } from "@/backend/safe-log";
import { findPlan } from "@/shared/plans";

const DEFAULT_PAGE_SIZE = 50;

export type AdminResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

export type MemberFilters = {
  q?: string;
  plan?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

const escapeLike = (value: string) => value.replace(/[%_\\]/g, "\\$&");

export async function listMembers(
  db: Db,
  { q, plan, status, page = 1, pageSize = DEFAULT_PAGE_SIZE }: MemberFilters,
  now: Date
) {
  const latest = db
    .selectDistinctOn([memberships.userId])
    .from(memberships)
    .orderBy(memberships.userId, desc(memberships.createdAt))
    .as("latest");

  // A membership past its end date counts as expired even before the nightly
  // job has marked it, so the list never shows a lapsed member as active.
  const effectiveStatus = sql<string | null>`case
    when ${latest.status} = 'active' and ${latest.expiresAt} < ${now.toISOString()}::timestamp
    then 'expired' else ${latest.status} end`;

  const pattern = q ? `%${escapeLike(q.trim())}%` : null;
  const statusCondition =
    status === "none"
      ? isNull(latest.id)
      : status
        ? eq(effectiveStatus, status)
        : undefined;

  const conditions = and(
    pattern
      ? or(
          ilike(user.name, pattern),
          ilike(user.email, pattern),
          ilike(profiles.phone, pattern),
          ilike(latest.memberNumber, pattern)
        )
      : undefined,
    plan ? eq(latest.planSlug, plan) : undefined,
    statusCondition
  );

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      phone: profiles.phone,
      designation: profiles.designation,
      institution: profiles.institution,
      country: profiles.country,
      planSlug: latest.planSlug,
      status: effectiveStatus,
      memberNumber: latest.memberNumber,
      startsAt: latest.startsAt,
      expiresAt: latest.expiresAt,
    })
    .from(user)
    .leftJoin(profiles, eq(profiles.userId, user.id))
    .leftJoin(latest, eq(latest.userId, user.id))
    .where(conditions)
    .orderBy(desc(user.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [{ total }] = await db
    .select({ total: count() })
    .from(user)
    .leftJoin(profiles, eq(profiles.userId, user.id))
    .leftJoin(latest, eq(latest.userId, user.id))
    .where(conditions);

  return { rows, total };
}

export async function getMemberDetail(db: Db, userId: string) {
  const [account] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (!account) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  return {
    ...account,
    profile: profile ?? null,
    memberships: await db
      .select()
      .from(memberships)
      .where(eq(memberships.userId, userId))
      .orderBy(desc(memberships.createdAt)),
    payments: await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt)),
    registrations: await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.userId, userId),
          eq(eventRegistrations.status, "confirmed")
        )
      ),
  };
}

async function sendWelcome(deps: PaymentDeps, membership: Membership) {
  const payment = await findPaymentForMembership(deps.db, membership.id);
  await deps.sendEmail(await welcomeEmailFor(deps, membership, payment));
}

export async function approveMembership(
  deps: PaymentDeps,
  membershipId: string,
  adminEmail: string
): Promise<AdminResult> {
  const application = await findMembership(deps.db, membershipId);
  const plan = findPlan(application?.planSlug);
  if (application?.status !== "pending_approval" || !plan) {
    return { ok: false, message: "This application is not waiting for approval." };
  }

  const now = deps.now();
  const approved = await deps.db.transaction(async (tx) => {
    const [row] = await tx
      .update(memberships)
      .set({
        ...(await activationFields(tx, plan, now)),
        decidedBy: adminEmail,
        decidedAt: now,
      })
      .where(
        and(
          eq(memberships.id, membershipId),
          eq(memberships.status, "pending_approval")
        )
      )
      .returning();
    return row;
  });

  try {
    await sendWelcome(deps, approved);
    return { ok: true, message: "Approved. Certificate emailed." };
  } catch (error) {
    console.error("Failed to send approval email", safeLogValue(error));
    return { ok: true, message: "Approved, but the email failed. Use Resend." };
  }
}

async function refundFor(deps: PaymentDeps, membershipId: string) {
  const payment = await findPaymentForMembership(deps.db, membershipId);
  if (payment?.status !== "paid" || !payment.razorpayPaymentId) return false;

  try {
    await deps.gateway.refundPayment(payment.razorpayPaymentId);
    await deps.db
      .update(payments)
      .set({ status: "refunded", refundedAt: deps.now() })
      .where(eq(payments.id, payment.id));
    return true;
  } catch (error) {
    console.error("Failed to refund payment", safeLogValue(error));
    return false;
  }
}

export async function rejectMembership(
  deps: PaymentDeps,
  membershipId: string,
  adminEmail: string
): Promise<AdminResult> {
  const application = await findMembership(deps.db, membershipId);
  if (application?.status !== "pending_approval") {
    return { ok: false, message: "This application is not waiting for approval." };
  }

  await deps.db
    .update(memberships)
    .set({
      status: "rejected",
      decidedBy: adminEmail,
      decidedAt: deps.now(),
    })
    .where(eq(memberships.id, membershipId));

  const refunded = await refundFor(deps, membershipId);

  try {
    const contact = await findMemberContact(deps.db, application.userId);
    if (contact) {
      await deps.sendEmail(
        membershipRejectedEmail({
          to: contact.email,
          name: contact.name,
          planName: findPlan(application.planSlug)?.name ?? application.planSlug,
          refunded,
        })
      );
    }
  } catch (error) {
    console.error("Failed to send rejection email", safeLogValue(error));
  }

  return {
    ok: true,
    message: refunded
      ? "Rejected and refunded."
      : "Rejected, but the refund failed. Refund it in Razorpay.",
  };
}

export async function removeMember(
  deps: PaymentDeps,
  userId: string,
  reason: string,
  adminEmail: string
): Promise<AdminResult> {
  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    return { ok: false, message: "Please give a reason." };
  }

  await deps.db.transaction(async (tx) => {
    await tx
      .update(user)
      .set({ banned: true, banReason: trimmedReason })
      .where(eq(user.id, userId));
    await tx.delete(session).where(eq(session.userId, userId));
    await tx
      .update(memberships)
      .set({
        status: "removed",
        removedReason: trimmedReason,
        decidedBy: adminEmail,
        decidedAt: deps.now(),
      })
      .where(
        and(
          eq(memberships.userId, userId),
          inArray(memberships.status, ["pending_approval", "active"])
        )
      );
  });

  return { ok: true, message: "Member removed." };
}

export async function reinstateMember(
  deps: PaymentDeps,
  userId: string
): Promise<AdminResult> {
  const [removed] = await deps.db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.status, "removed")))
    .orderBy(desc(memberships.createdAt))
    .limit(1);

  await deps.db.transaction(async (tx) => {
    await tx
      .update(user)
      .set({ banned: false, banReason: null })
      .where(eq(user.id, userId));

    if (removed) {
      await tx
        .update(memberships)
        .set({
          // Only approved memberships ever got a number.
          status: removed.memberNumber ? "active" : "pending_approval",
          removedReason: null,
        })
        .where(eq(memberships.id, removed.id));
    }
  });

  return { ok: true, message: "Member reinstated." };
}

export async function resendWelcomeEmail(
  deps: PaymentDeps,
  membershipId: string
): Promise<AdminResult> {
  const membership = await findMembership(deps.db, membershipId);
  if (membership?.status !== "active") {
    return { ok: false, message: "Only active memberships have a certificate." };
  }

  try {
    await sendWelcome(deps, membership);
    return { ok: true, message: "Email sent." };
  } catch (error) {
    console.error("Failed to resend welcome email", safeLogValue(error));
    return { ok: false, message: "The email could not be sent." };
  }
}
