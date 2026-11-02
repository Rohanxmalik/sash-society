import "server-only";
import { eq } from "drizzle-orm";
import { isAdminEmail, requireSession } from "@/backend/auth/session";
import { getDb } from "@/backend/db";
import { payments } from "@/backend/db/schema";
import { findMembership } from "@/backend/members/repository";
import {
  CERTIFICATE_FILENAME,
  certificatePdfFor,
  RECEIPT_FILENAME,
  receiptPdfFor,
} from "./load";

const notFound = () => new Response(null, { status: 404 });

function pdfResponse(content: Uint8Array, filename: string) {
  return new Response(Buffer.from(content), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "private, no-store",
    },
  });
}

const canAccess = (
  { user }: { user: { id: string; email: string } },
  ownerId: string | null
) => user.id === ownerId || isAdminEmail(user.email);

// Missing and forbidden look the same, so ids cannot be probed.
export async function receiptResponse(paymentId: string) {
  const session = await requireSession();
  const db = getDb();
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!payment?.paidAt || !canAccess(session, payment.userId)) {
    return notFound();
  }
  return pdfResponse(await receiptPdfFor(db, payment), RECEIPT_FILENAME);
}

export async function certificateResponse(membershipId: string) {
  const session = await requireSession();
  const db = getDb();
  const membership = await findMembership(db, membershipId);

  if (
    membership?.status !== "active" ||
    !canAccess(session, membership.userId)
  ) {
    return notFound();
  }
  return pdfResponse(await certificatePdfFor(db, membership), CERTIFICATE_FILENAME);
}
