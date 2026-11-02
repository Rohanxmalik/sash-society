CREATE TABLE "journal_files" (
	"paper_id" text PRIMARY KEY NOT NULL,
	"data" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_papers" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"title" text NOT NULL,
	"authors" text NOT NULL,
	"abstract" text DEFAULT '' NOT NULL,
	"article_type" text NOT NULL,
	"status" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"review_note" text,
	"decided_by" text,
	"decided_at" timestamp,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "journal_files" ADD CONSTRAINT "journal_files_paper_id_journal_papers_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."journal_papers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_papers" ADD CONSTRAINT "journal_papers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "journal_papers_status_idx" ON "journal_papers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "journal_papers_user_idx" ON "journal_papers" USING btree ("user_id");