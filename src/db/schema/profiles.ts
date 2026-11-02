import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  country: text("country").notNull(),
  institution: text("institution"),
  qualification: text("qualification"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
