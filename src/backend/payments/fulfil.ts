import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  nextReceiptNumber,
  nextRegistrationNumber,
} from "@/backend/db/numbers";
import { eventRegistrations, memberships, payments } from "@/backend/db/schema";
import type { Db } from "@/backend/db/types";
import { activationFields } from "@/backend/members/activation";
import {
  findLiveMembership,
  findMembership,
} from "@/backend/members/repository";
import { displayStatus } from "@/backend/members/rules";
import { safeLogValue } from "@/backend/safe-log";
import type { ConfirmResult, PaymentOutcome } from "@/shared/checkout";
import { findEvent } from "@/shared/events";
import { findPlan } from "@/shared/plans";
import type { PaymentDeps } from "./deps";
import { notifyPayment } from "./notify";

const CONFIRM_FAILED =
  "We could not confirm your payment yet. If money was taken, we will confirm it by email shortly.";

const checkoutResponseSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});

type Payment = typeof payments.$inferSelect;
type Applied = { membershipId?: string; note?: string };

export async function findPaymentByOrderId(db: Db, orderId: string) {
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.razorpayOrderId, orderId))
    .limit(1);
  return payment ?? null;
}

// Razorpay's record decides, never what the browser reported.
async function ensureCaptured(
  { gateway }: PaymentDeps,
  payment: Payment,
  paymentId: string
) {
  const remote = await gateway.fetchPayment(paymentId);
  const matches =
    remote.orderId === payment.razorpayOrderId &&
    remote.amountMinor === payment.amountMinor &&
    remote.currency === payment.currency;
  if (!matches) {
    throw new Error(
      `Payment ${paymentId} does not match order ${payment.razorpayOrderId}`
    );
  }

  if (remote.status === "captured") return;
  if (remote.status !== "authorized") {
    throw new Error(`Payment ${paymentId} is not complete: ${remote.status}`);
  }

  try {
    await gateway.capturePayment(paymentId, remote.amountMinor, remote.currency);
  } catch (error) {
    // Razorpay's automatic capture can land between the fetch and this call.
    const latest = await gateway.fetchPayment(paymentId);
    if (latest.status !== "captured") throw error;
  }
}

async function applyMembership(
  tx: Db,
  payment: Payment,
  now: Date
): Promise<Applied> {
  const plan = findPlan(payment.planSlug);
  const userId = payment.userId;
  if (!plan || !userId) {
    return { note: "Plan or member missing. Please review." };
  }

  const live = await findLiveMembership(tx, userId);
  if (live && displayStatus(live, now) !== "expired") {
    return {
      note: "Duplicate payment: this member already has a membership. Please refund.",
    };
  }
  if (live) {
    await tx
      .update(memberships)
      .set({ status: "expired" })
      .where(eq(memberships.id, live.id));
  }

  const activation = plan.requiresApproval
    ? { status: "pending_approval" as const }
    : await activationFields(tx, plan, now);
  const [membership] = await tx
    .insert(memberships)
    .values({
      ...activation,
      userId,
      planSlug: plan.slug,
      organisationName: payment.organisationName,
      declarationAcceptedAt: payment.declarationAcceptedAt,
    })
    .returning({ id: memberships.id });
  return { membershipId: membership.id };
}

async function applyRegistration(
  tx: Db,
  payment: Payment,
  now: Date
): Promise<Applied> {
  const [registration] = await tx
    .select()
    .from(eventRegistrations)
    .where(eq(eventRegistrations.id, payment.eventRegistrationId ?? ""))
    .limit(1);
  const numberCode =
    registration && findEvent(registration.eventId)?.registration?.numberCode;
  if (!numberCode) return { note: "Registration missing. Please review." };

  const [confirmed] = await tx
    .select({ id: eventRegistrations.id })
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, registration.eventId),
        eq(eventRegistrations.email, registration.email),
        eq(eventRegistrations.status, "confirmed")
      )
    )
    .limit(1);
  if (confirmed) {
    return {
      note: "Duplicate registration: this email is already registered. Please refund.",
    };
  }

  await tx
    .update(eventRegistrations)
    .set({
      status: "confirmed",
      registrationNumber: await nextRegistrationNumber(tx, numberCode),
      confirmedAt: now,
    })
    .where(eq(eventRegistrations.id, registration.id));
  return {};
}

// The status filter is what makes this safe to call twice: when the browser and
// the webhook race, only one of them can move the payment out of "created".
async function claimPayment(
  tx: Db,
  payment: Payment,
  paymentId: string,
  now: Date
) {
  const [claimed] = await tx
    .update(payments)
    .set({ status: "paid", razorpayPaymentId: paymentId, paidAt: now })
    .where(and(eq(payments.id, payment.id), eq(payments.status, "created")))
    .returning();
  if (!claimed) return null;

  const applied =
    claimed.purpose === "membership"
      ? await applyMembership(tx, claimed, now)
      : await applyRegistration(tx, claimed, now);

  await tx
    .update(payments)
    .set({
      receiptNumber: await nextReceiptNumber(tx, now),
      membershipId: applied.membershipId,
      note: applied.note,
    })
    .where(eq(payments.id, claimed.id));
  return applied;
}

async function outcomeOf(db: Db, orderId: string): Promise<PaymentOutcome> {
  const payment = await findPaymentByOrderId(db, orderId);
  if (payment?.purpose === "event") return "registered";

  const membership = payment?.membershipId
    ? await findMembership(db, payment.membershipId)
    : null;
  return membership?.status === "pending_approval"
    ? "pending_approval"
    : "active";
}

export async function fulfilPayment(
  deps: PaymentDeps,
  { orderId, paymentId }: { orderId: string; paymentId: string }
): Promise<PaymentOutcome> {
  const payment = await findPaymentByOrderId(deps.db, orderId);
  if (!payment) throw new Error(`Unknown order ${orderId}`);

  if (payment.status === "created") {
    await ensureCaptured(deps, payment, paymentId);

    const now = deps.now();
    const applied = await deps.db.transaction((tx) =>
      claimPayment(tx, payment, paymentId, now)
    );

    if (applied?.note) {
      console.error("Payment needs review", { orderId, note: applied.note });
    } else if (applied) {
      await notifyPayment(deps, payment.id);
    }
  }

  return outcomeOf(deps.db, orderId);
}

export async function confirmPayment(
  deps: PaymentDeps,
  input: unknown
): Promise<ConfirmResult> {
  const parsed = checkoutResponseSchema.safeParse(input);
  if (!parsed.success || !deps.gateway.isValidSignature(parsed.data)) {
    return { ok: false, message: CONFIRM_FAILED };
  }

  try {
    return { ok: true, outcome: await fulfilPayment(deps, parsed.data) };
  } catch (error) {
    console.error("Failed to confirm payment", safeLogValue(error));
    return { ok: false, message: CONFIRM_FAILED };
  }
}
