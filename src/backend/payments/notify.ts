import { eq } from "drizzle-orm";
import { eventRegistrations, payments } from "@/backend/db/schema";
import {
  CERTIFICATE_FILENAME,
  certificatePdfFor,
  findMemberContact,
  RECEIPT_FILENAME,
  receiptPdfFor,
} from "@/backend/documents/load";
import {
  applicationReceivedEmail,
  eventConfirmationEmail,
  welcomeMemberEmail,
} from "@/backend/email/templates";
import { findMembership, type Membership } from "@/backend/members/repository";
import { safeLogValue } from "@/backend/safe-log";
import { findEvent } from "@/shared/events";
import { findPlan } from "@/shared/plans";
import type { PaymentDeps } from "./deps";

type Payment = typeof payments.$inferSelect;

const pdfAttachment = (filename: string, content: Uint8Array) => ({
  filename,
  content,
});

export async function welcomeEmailFor(
  { db, baseURL }: Pick<PaymentDeps, "db" | "baseURL">,
  membership: Membership,
  payment: Payment | null
) {
  const contact = await findMemberContact(db, membership.userId);
  if (!contact) throw new Error(`No member for ${membership.id}`);

  const receipt = payment
    ? [pdfAttachment(RECEIPT_FILENAME, await receiptPdfFor(db, payment))]
    : [];

  return welcomeMemberEmail({
    to: contact.email,
    name: contact.name,
    planName: findPlan(membership.planSlug)?.name ?? membership.planSlug,
    memberNumber: membership.memberNumber ?? "",
    expiresAt: membership.expiresAt,
    profileUrl: `${baseURL}/profile`,
    attachments: [
      ...receipt,
      pdfAttachment(
        CERTIFICATE_FILENAME,
        await certificatePdfFor(db, membership)
      ),
    ],
  });
}

async function membershipEmail(deps: PaymentDeps, payment: Payment) {
  const membership = await findMembership(deps.db, payment.membershipId ?? "");
  if (!membership) throw new Error(`No membership for ${payment.id}`);

  if (membership.status === "active") {
    return welcomeEmailFor(deps, membership, payment);
  }

  const contact = await findMemberContact(deps.db, membership.userId);
  if (!contact) throw new Error(`No member for ${payment.id}`);

  return applicationReceivedEmail({
    to: contact.email,
    name: contact.name,
    planName: findPlan(membership.planSlug)?.name ?? membership.planSlug,
    attachments: [
      pdfAttachment(RECEIPT_FILENAME, await receiptPdfFor(deps.db, payment)),
    ],
  });
}

async function eventEmail({ db }: PaymentDeps, payment: Payment) {
  const [registration] = await db
    .select()
    .from(eventRegistrations)
    .where(eq(eventRegistrations.id, payment.eventRegistrationId ?? ""))
    .limit(1);
  const event = registration && findEvent(registration.eventId);
  if (!event) throw new Error(`No registration for ${payment.id}`);

  return eventConfirmationEmail({
    to: registration.email,
    name: registration.fullName,
    eventTitle: event.title,
    eventDate: event.dateLabel ?? event.date,
    eventLocation: event.location,
    optionLabel:
      event.registration?.options.find((o) => o.id === registration.optionId)
        ?.label ?? registration.optionId,
    registrationNumber: registration.registrationNumber ?? "",
    keyDates: event.details?.importantDates ?? [],
    attachments: [
      pdfAttachment(RECEIPT_FILENAME, await receiptPdfFor(db, payment)),
    ],
  });
}

export async function sendPaymentEmail(deps: PaymentDeps, paymentId: string) {
  const [payment] = await deps.db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);
  if (!payment) throw new Error(`Unknown payment ${paymentId}`);

  const email =
    payment.purpose === "membership"
      ? await membershipEmail(deps, payment)
      : await eventEmail(deps, payment);

  await deps.sendEmail(email);
  await deps.db
    .update(payments)
    .set({ emailSentAt: deps.now() })
    .where(eq(payments.id, payment.id));
}

// A failed email must not undo a completed payment. The daily job retries it.
export async function notifyPayment(deps: PaymentDeps, paymentId: string) {
  try {
    await sendPaymentEmail(deps, paymentId);
  } catch (error) {
    console.error("Failed to send payment email", {
      paymentId,
      error: safeLogValue(error),
    });
  }
}
