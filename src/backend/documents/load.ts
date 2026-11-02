import { eq } from "drizzle-orm";
import {
  eventRegistrations,
  payments,
  profiles,
  user,
} from "@/backend/db/schema";
import type { Db } from "@/backend/db/types";
import type { Membership } from "@/backend/members/repository";
import { clientConfig } from "@/shared/client-config";
import type { Currency } from "@/shared/money";
import { findPlan } from "@/shared/plans";
import { buildCertificatePdf } from "./certificate";
import { buildReceiptPdf } from "./receipt";

type Payment = typeof payments.$inferSelect;

export const RECEIPT_FILENAME = "SASS-receipt.pdf";
export const CERTIFICATE_FILENAME = "SASS-membership-certificate.pdf";

const receiptTitle = () =>
  clientConfig.society.gstin ? "Invoice" : "Payment Receipt";

export async function findMemberContact(db: Db, userId: string) {
  const [row] = await db
    .select({
      email: user.email,
      accountName: user.name,
      fullName: profiles.fullName,
      phone: profiles.phone,
    })
    .from(user)
    .leftJoin(profiles, eq(profiles.userId, user.id))
    .where(eq(user.id, userId))
    .limit(1);
  return row ? { ...row, name: row.fullName ?? row.accountName } : null;
}

async function payerOf(db: Db, payment: Payment) {
  if (payment.eventRegistrationId) {
    const [registration] = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.id, payment.eventRegistrationId))
      .limit(1);
    if (registration) {
      return {
        name: registration.fullName,
        email: registration.email,
        phone: registration.whatsapp,
      };
    }
  }

  const contact = payment.userId
    ? await findMemberContact(db, payment.userId)
    : null;
  return {
    name: payment.organisationName ?? contact?.name ?? "Member",
    email: contact?.email ?? "",
    phone: contact?.phone,
  };
}

export async function receiptPdfFor(db: Db, payment: Payment) {
  return buildReceiptPdf({
    title: receiptTitle(),
    receiptNumber: payment.receiptNumber ?? payment.id,
    paidAt: payment.paidAt ?? payment.createdAt,
    billedTo: await payerOf(db, payment),
    description: payment.description,
    amountMinor: payment.amountMinor,
    currency: payment.currency as Currency,
    paymentReference: payment.razorpayPaymentId ?? payment.razorpayOrderId,
  });
}

export async function certificatePdfFor(db: Db, membership: Membership) {
  const contact = await findMemberContact(db, membership.userId);
  return buildCertificatePdf({
    name: membership.organisationName ?? contact?.name ?? "Member",
    planName: findPlan(membership.planSlug)?.name ?? membership.planSlug,
    memberNumber: membership.memberNumber ?? "",
    issuedAt: membership.startsAt ?? membership.createdAt,
    expiresAt: membership.expiresAt,
  });
}
