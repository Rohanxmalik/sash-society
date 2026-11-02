import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { eventRegistrations } from "./events";
import { memberships } from "./memberships";

export type PaymentPurpose = "membership" | "event";
export type PaymentStatus = "created" | "paid" | "failed" | "refunded";

export const payments = pgTable(
  "payments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    purpose: text("purpose").$type<PaymentPurpose>().notNull(),
    status: text("status").$type<PaymentStatus>().notNull(),
    description: text("description").notNull(),
    amountMinor: integer("amount_minor").notNull(),
    currency: text("currency").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    planSlug: text("plan_slug"),
    organisationName: text("organisation_name"),
    declarationAcceptedAt: timestamp("declaration_accepted_at"),
    membershipId: text("membership_id").references(() => memberships.id, {
      onDelete: "set null",
    }),
    eventRegistrationId: text("event_registration_id").references(
      () => eventRegistrations.id,
      { onDelete: "set null" }
    ),
    razorpayOrderId: text("razorpay_order_id").notNull().unique(),
    razorpayPaymentId: text("razorpay_payment_id").unique(),
    receiptNumber: text("receipt_number").unique(),
    // Set when money arrived but something needs a person, such as a refund.
    note: text("note"),
    paidAt: timestamp("paid_at"),
    emailSentAt: timestamp("email_sent_at"),
    refundedAt: timestamp("refunded_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("payments_user_idx").on(table.userId),
    index("payments_status_idx").on(table.status),
  ]
);
