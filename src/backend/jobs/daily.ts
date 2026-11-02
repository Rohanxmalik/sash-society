import { and, between, eq, isNull, lt, isNotNull } from "drizzle-orm";
import { memberships, payments } from "@/backend/db/schema";
import { findMemberContact } from "@/backend/documents/load";
import { renewalReminderEmail } from "@/backend/email/templates";
import type { PaymentDeps } from "@/backend/payments/deps";
import { sendPaymentEmail } from "@/backend/payments/notify";
import { safeLogValue } from "@/backend/safe-log";
import { clientConfig } from "@/shared/client-config";
import { findPlan } from "@/shared/plans";

const DAY_MS = 24 * 60 * 60 * 1000;
const EMAIL_RETRY_DELAY_MS = 10 * 60 * 1000;

async function expireLapsedMemberships({ db }: PaymentDeps, now: Date) {
  const expired = await db
    .update(memberships)
    .set({ status: "expired" })
    .where(
      and(
        eq(memberships.status, "active"),
        isNotNull(memberships.expiresAt),
        lt(memberships.expiresAt, now)
      )
    )
    .returning({ id: memberships.id });
  return expired.length;
}

async function sendRenewalReminders(deps: PaymentDeps, now: Date) {
  const { db, baseURL, sendEmail } = deps;
  const cutoff = new Date(
    now.getTime() + clientConfig.membership.reminderDaysBeforeExpiry * DAY_MS
  );
  const due = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.status, "active"),
        isNull(memberships.reminderSentAt),
        between(memberships.expiresAt, now, cutoff)
      )
    );

  let reminded = 0;
  for (const membership of due) {
    try {
      const contact = await findMemberContact(db, membership.userId);
      if (!contact || !membership.expiresAt) continue;

      await sendEmail(
        renewalReminderEmail({
          to: contact.email,
          name: contact.name,
          planName: findPlan(membership.planSlug)?.name ?? membership.planSlug,
          expiresAt: membership.expiresAt,
          renewUrl: `${baseURL}/membership`,
        })
      );
      await db
        .update(memberships)
        .set({ reminderSentAt: now })
        .where(eq(memberships.id, membership.id));
      reminded += 1;
    } catch (error) {
      console.error("Failed to send renewal reminder", {
        membershipId: membership.id,
        error: safeLogValue(error),
      });
    }
  }
  return reminded;
}

async function retryUnsentEmails(deps: PaymentDeps, now: Date) {
  const unsent = await deps.db
    .select({ id: payments.id })
    .from(payments)
    .where(
      and(
        eq(payments.status, "paid"),
        isNull(payments.emailSentAt),
        isNull(payments.note),
        lt(payments.paidAt, new Date(now.getTime() - EMAIL_RETRY_DELAY_MS))
      )
    );

  let retried = 0;
  for (const { id } of unsent) {
    try {
      await sendPaymentEmail(deps, id);
      retried += 1;
    } catch (error) {
      console.error("Failed to retry payment email", {
        paymentId: id,
        error: safeLogValue(error),
      });
    }
  }
  return retried;
}

export async function runDailyJob(deps: PaymentDeps) {
  const now = deps.now();
  return {
    expired: await expireLapsedMemberships(deps, now),
    reminded: await sendRenewalReminders(deps, now),
    retried: await retryUnsentEmails(deps, now),
  };
}
