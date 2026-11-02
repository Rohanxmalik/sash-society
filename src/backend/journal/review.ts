import { and, eq } from "drizzle-orm";
import { journalFiles, journalPapers } from "@/backend/db/schema";
import type { PaperStatus } from "@/backend/db/schema";
import { findMemberContact } from "@/backend/documents/load";
import {
  paperNotAcceptedEmail,
  paperPublishedEmail,
} from "@/backend/email/templates";
import { journalBackIssueSchema } from "@/shared/validation/journal";
import { sendQuietly, type JournalDeps, type JournalResult } from "./deps";
import { checkUpload, type UploadedFile } from "./files";
import { storePaper, type NewPaper, type Paper } from "./repository";

const NOT_WAITING = "This work is not waiting for review.";

// The status check is part of the update, so two admins cannot both decide.
async function changeStatus(
  { db }: JournalDeps,
  paperId: string,
  from: PaperStatus,
  changes: Partial<NewPaper>
): Promise<Paper | null> {
  const [paper] = await db
    .update(journalPapers)
    .set(changes)
    .where(and(eq(journalPapers.id, paperId), eq(journalPapers.status, from)))
    .returning();
  return paper ?? null;
}

export async function approvePaper(
  deps: JournalDeps,
  paperId: string,
  adminEmail: string
): Promise<JournalResult> {
  const now = deps.now();
  const paper = await changeStatus(deps, paperId, "pending", {
    status: "published",
    publishedAt: now,
    decidedBy: adminEmail,
    decidedAt: now,
  });
  if (!paper) return { ok: false, message: NOT_WAITING };

  const author = paper.userId
    ? await findMemberContact(deps.db, paper.userId)
    : null;
  if (!author) return { ok: true, message: "Published." };

  const sent = await sendQuietly(
    deps,
    paperPublishedEmail({
      to: author.email,
      name: author.name,
      title: paper.title,
      url: `${deps.baseURL}/journal/archive`,
    })
  );
  return {
    ok: true,
    message: sent
      ? "Published. The author has been told."
      : "Published, but the email to the author failed.",
  };
}

export async function rejectPaper(
  deps: JournalDeps,
  paperId: string,
  reason: string,
  adminEmail: string
): Promise<JournalResult> {
  const reviewNote = reason.trim() || null;
  const paper = await changeStatus(deps, paperId, "pending", {
    status: "rejected",
    reviewNote,
    decidedBy: adminEmail,
    decidedAt: deps.now(),
  });
  if (!paper) return { ok: false, message: NOT_WAITING };

  // Otherwise rejected uploads would slowly fill the database.
  await deps.db.delete(journalFiles).where(eq(journalFiles.paperId, paperId));

  const author = paper.userId
    ? await findMemberContact(deps.db, paper.userId)
    : null;
  if (author) {
    await sendQuietly(
      deps,
      paperNotAcceptedEmail({
        to: author.email,
        name: author.name,
        title: paper.title,
        reason: reviewNote,
      })
    );
  }

  return { ok: true, message: "Rejected. The author has been told." };
}

export async function removePaper(
  deps: JournalDeps,
  paperId: string,
  adminEmail: string
): Promise<JournalResult> {
  const paper = await changeStatus(deps, paperId, "published", {
    status: "removed",
    decidedBy: adminEmail,
    decidedAt: deps.now(),
  });
  return paper
    ? { ok: true, message: "Removed from the journal." }
    : { ok: false, message: "This work is not published." };
}

// For back issues the society already has. These skip review.
export async function addPublishedPaper(
  deps: JournalDeps,
  input: unknown,
  file: UploadedFile,
  adminEmail: string
): Promise<JournalResult> {
  const parsed = journalBackIssueSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const upload = checkUpload(file);
  if (!upload.ok) return upload;

  const { title, authors, abstract, articleType, publishedOn } = parsed.data;
  await storePaper(
    deps.db,
    {
      ...upload.file,
      title,
      authors,
      abstract: abstract ?? "",
      articleType,
      status: "published",
      publishedAt: new Date(`${publishedOn}T12:00:00+05:30`),
      decidedBy: adminEmail,
      decidedAt: deps.now(),
    },
    file.bytes
  );

  return { ok: true, message: "Added to the journal." };
}
