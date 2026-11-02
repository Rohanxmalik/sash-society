import {
  customType,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export type PaperStatus = "pending" | "published" | "rejected" | "removed";

const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({
  dataType: () => "bytea",
});

export const journalPapers = pgTable(
  "journal_papers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // Empty for back issues added by an admin.
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    authors: text("authors").notNull(),
    abstract: text("abstract").notNull().default(""),
    articleType: text("article_type").notNull(),
    status: text("status").$type<PaperStatus>().notNull(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    reviewNote: text("review_note"),
    decidedBy: text("decided_by"),
    decidedAt: timestamp("decided_at"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("journal_papers_status_idx").on(table.status),
    index("journal_papers_user_idx").on(table.userId),
  ]
);

// Kept apart so that listing papers never loads the files themselves.
export const journalFiles = pgTable("journal_files", {
  paperId: text("paper_id")
    .primaryKey()
    .references(() => journalPapers.id, { onDelete: "cascade" }),
  data: bytea("data").notNull(),
});
