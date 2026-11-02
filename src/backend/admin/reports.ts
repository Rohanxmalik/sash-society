import {
  and,
  count,
  desc,
  eq,
  gt,
  inArray,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import { toCsv } from "@/backend/csv";
import {
  eventRegistrations,
  memberships,
  payments,
  user,
} from "@/backend/db/schema";
import type { Db } from "@/backend/db/types";
import { countPendingPapers } from "@/backend/journal/repository";
import { formatDateIndia } from "@/shared/dates";
import { findEvent } from "@/shared/events";
import { formatMoneyPlain, type Currency } from "@/shared/money";
import { findPlan } from "@/shared/plans";
import { listMembers } from "./members";

const EXPORT_LIMIT = 100_000;
const PAYMENT_LIST_LIMIT = 1000;

const dateCell = (date: Date | null) => (date ? formatDateIndia(date) : "");

export async function getOverview(db: Db, now: Date) {
  const [{ accounts }] = await db.select({ accounts: count() }).from(user);
  const [{ activeMembers }] = await db
    .select({ activeMembers: count() })
    .from(memberships)
    .where(
      and(
        eq(memberships.status, "active"),
        or(isNull(memberships.expiresAt), gt(memberships.expiresAt, now))
      )
    );
  const [{ pendingApprovals }] = await db
    .select({ pendingApprovals: count() })
    .from(memberships)
    .where(eq(memberships.status, "pending_approval"));
  const [{ confirmedRegistrations }] = await db
    .select({ confirmedRegistrations: count() })
    .from(eventRegistrations)
    .where(eq(eventRegistrations.status, "confirmed"));
  const revenue = await db
    .select({
      currency: payments.currency,
      amountMinor: sql<string>`sum(${payments.amountMinor})`,
    })
    .from(payments)
    .where(eq(payments.status, "paid"))
    .groupBy(payments.currency);
  const [{ needsReview }] = await db
    .select({ needsReview: count() })
    .from(payments)
    .where(sql`${payments.note} is not null`);

  return {
    accounts,
    activeMembers,
    pendingApprovals,
    confirmedRegistrations,
    needsReview,
    papersToReview: await countPendingPapers(db),
    revenue: revenue.map((row) => ({
      currency: row.currency as Currency,
      amountMinor: Number(row.amountMinor),
    })),
  };
}

export async function listRegistrations(db: Db, eventId: string) {
  return db
    .select({
      id: eventRegistrations.id,
      registrationNumber: eventRegistrations.registrationNumber,
      fullName: eventRegistrations.fullName,
      email: eventRegistrations.email,
      whatsapp: eventRegistrations.whatsapp,
      affiliation: eventRegistrations.affiliation,
      designation: eventRegistrations.designation,
      optionId: eventRegistrations.optionId,
      paperTitle: eventRegistrations.paperTitle,
      subTheme: eventRegistrations.subTheme,
      confirmedAt: eventRegistrations.confirmedAt,
      paymentId: payments.id,
      amountMinor: payments.amountMinor,
      currency: payments.currency,
      razorpayPaymentId: payments.razorpayPaymentId,
    })
    .from(eventRegistrations)
    .innerJoin(payments, eq(payments.eventRegistrationId, eventRegistrations.id))
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.status, "confirmed"),
        eq(payments.status, "paid")
      )
    )
    .orderBy(desc(eventRegistrations.confirmedAt));
}

export async function registrationCount(db: Db, eventId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.status, "confirmed")
      )
    );
  return total;
}

export async function listPayments(db: Db) {
  return db
    .select({
      id: payments.id,
      purpose: payments.purpose,
      status: payments.status,
      description: payments.description,
      amountMinor: payments.amountMinor,
      currency: payments.currency,
      receiptNumber: payments.receiptNumber,
      razorpayPaymentId: payments.razorpayPaymentId,
      note: payments.note,
      paidAt: payments.paidAt,
      emailSentAt: payments.emailSentAt,
      userId: payments.userId,
      memberEmail: user.email,
      guestEmail: eventRegistrations.email,
    })
    .from(payments)
    .leftJoin(user, eq(user.id, payments.userId))
    .leftJoin(
      eventRegistrations,
      eq(eventRegistrations.id, payments.eventRegistrationId)
    )
    .where(inArray(payments.status, ["paid", "refunded"]))
    .orderBy(desc(payments.paidAt))
    .limit(PAYMENT_LIST_LIMIT);
}

export async function membersCsv(db: Db, now: Date) {
  const { rows } = await listMembers(db, { pageSize: EXPORT_LIMIT }, now);

  return toCsv(
    [
      "Name",
      "Email",
      "Phone",
      "Designation",
      "Institution",
      "Country",
      "Plan",
      "Status",
      "Member number",
      "Joined",
      "Expires",
      "Signed up",
    ],
    rows.map((row) => [
      row.name,
      row.email,
      row.phone,
      row.designation,
      row.institution,
      row.country,
      findPlan(row.planSlug)?.name ?? "",
      row.status ?? "no membership",
      row.memberNumber,
      dateCell(row.startsAt),
      dateCell(row.expiresAt),
      dateCell(row.createdAt),
    ])
  );
}

export async function registrationsCsv(db: Db, eventId: string) {
  const options = findEvent(eventId)?.registration?.options ?? [];
  const rows = await listRegistrations(db, eventId);

  return toCsv(
    [
      "Registration number",
      "Name",
      "Email",
      "WhatsApp",
      "Affiliation",
      "Designation",
      "Attending",
      "Paper title",
      "Sub-theme",
      "Amount paid",
      "Payment reference",
      "Registered on",
    ],
    rows.map((row) => [
      row.registrationNumber,
      row.fullName,
      row.email,
      row.whatsapp,
      row.affiliation,
      row.designation,
      options.find((option) => option.id === row.optionId)?.label ?? row.optionId,
      row.paperTitle,
      row.subTheme,
      formatMoneyPlain(row.amountMinor, row.currency as Currency),
      row.razorpayPaymentId,
      dateCell(row.confirmedAt),
    ])
  );
}

export async function paymentsCsv(db: Db) {
  const rows = await listPayments(db);

  return toCsv(
    [
      "Date",
      "Receipt number",
      "Description",
      "Payer",
      "Amount",
      "Status",
      "Payment reference",
      "Note",
    ],
    rows.map((row) => [
      dateCell(row.paidAt),
      row.receiptNumber,
      row.description,
      row.memberEmail ?? row.guestEmail,
      formatMoneyPlain(row.amountMinor, row.currency as Currency),
      row.status,
      row.razorpayPaymentId,
      row.note,
    ])
  );
}
