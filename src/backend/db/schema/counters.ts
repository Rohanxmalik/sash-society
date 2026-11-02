import { integer, pgTable, text } from "drizzle-orm/pg-core";

// Sequences for member, receipt and registration numbers.
export const counters = pgTable("counters", {
  key: text("key").primaryKey(),
  value: integer("value").notNull(),
});
