import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export type MembershipStatus =
  | "pending_approval"
  | "active"
  | "expired"
  | "rejected"
  | "removed";

export const memberships = pgTable(
  "memberships",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    planSlug: text("plan_slug").notNull(),
    status: text("status").$type<MembershipStatus>().notNull(),
    memberNumber: text("member_number").unique(),
    organisationName: text("organisation_name"),
    startsAt: timestamp("starts_at"),
    expiresAt: timestamp("expires_at"),
    declarationAcceptedAt: timestamp("declaration_accepted_at"),
    reminderSentAt: timestamp("reminder_sent_at"),
    decidedBy: text("decided_by"),
    decidedAt: timestamp("decided_at"),
    removedReason: text("removed_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // A member can hold only one live membership, even if two payments race.
    uniqueIndex("memberships_one_live_per_user")
      .on(table.userId)
      .where(sql`${table.status} in ('pending_approval', 'active')`),
    index("memberships_status_idx").on(table.status),
  ]
);
