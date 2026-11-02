import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export type RegistrationStatus = "pending_payment" | "confirmed" | "cancelled";

export const eventRegistrations = pgTable(
  "event_registrations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    eventId: text("event_id").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    whatsapp: text("whatsapp").notNull(),
    affiliation: text("affiliation").notNull(),
    designation: text("designation").notNull(),
    optionId: text("option_id").notNull(),
    paperTitle: text("paper_title"),
    subTheme: text("sub_theme"),
    status: text("status").$type<RegistrationStatus>().notNull(),
    registrationNumber: text("registration_number").unique(),
    confirmedAt: timestamp("confirmed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("event_registrations_one_confirmed_per_email")
      .on(table.eventId, sql`lower(${table.email})`)
      .where(sql`${table.status} = 'confirmed'`),
    index("event_registrations_event_idx").on(table.eventId),
  ]
);
