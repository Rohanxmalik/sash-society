import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  designation: text("designation").notNull(),
  institution: text("institution"),
  country: text("country"),
  education: text("education"),
  experience: text("experience"),
  publications: text("publications"),
  website: text("website"),
  // A compressed image as a data URL. At 30-50 sign-ups a month this stays far
  // below the database limit, so no separate storage service is needed.
  photo: text("photo"),
  showInDirectory: boolean("show_in_directory").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
