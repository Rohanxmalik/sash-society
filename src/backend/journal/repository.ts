import { and, count, desc, eq, sql } from "drizzle-orm";
import { journalFiles, journalPapers, user } from "@/backend/db/schema";
import type { Db } from "@/backend/db/types";

const MAX_LISTED_PAPERS = 1000;

export type Paper = typeof journalPapers.$inferSelect;
export type NewPaper = typeof journalPapers.$inferInsert;

export async function storePaper(db: Db, paper: NewPaper, data: Uint8Array) {
  await db.transaction(async (tx) => {
    const [{ id }] = await tx
      .insert(journalPapers)
      .values(paper)
      .returning({ id: journalPapers.id });
    await tx.insert(journalFiles).values({ paperId: id, data });
  });
}

export async function listPublishedPapers(
  db: Db,
  limit: number = MAX_LISTED_PAPERS
) {
  return db
    .select({
      id: journalPapers.id,
      title: journalPapers.title,
      authors: journalPapers.authors,
      abstract: journalPapers.abstract,
      articleType: journalPapers.articleType,
      contentType: journalPapers.contentType,
      publishedAt: journalPapers.publishedAt,
    })
    .from(journalPapers)
    .where(eq(journalPapers.status, "published"))
    .orderBy(desc(journalPapers.publishedAt))
    .limit(limit);
}

export async function listSubmissionsBy(db: Db, userId: string) {
  return db
    .select({
      id: journalPapers.id,
      title: journalPapers.title,
      status: journalPapers.status,
      reviewNote: journalPapers.reviewNote,
      createdAt: journalPapers.createdAt,
    })
    .from(journalPapers)
    .where(eq(journalPapers.userId, userId))
    .orderBy(desc(journalPapers.createdAt))
    .limit(MAX_LISTED_PAPERS);
}

export async function listPapersForAdmin(db: Db) {
  return db
    .select({
      id: journalPapers.id,
      title: journalPapers.title,
      authors: journalPapers.authors,
      abstract: journalPapers.abstract,
      articleType: journalPapers.articleType,
      status: journalPapers.status,
      fileName: journalPapers.fileName,
      createdAt: journalPapers.createdAt,
      publishedAt: journalPapers.publishedAt,
      submitterEmail: user.email,
    })
    .from(journalPapers)
    .leftJoin(user, eq(user.id, journalPapers.userId))
    .orderBy(
      sql`case when ${journalPapers.status} = 'pending' then 0 else 1 end`,
      desc(journalPapers.createdAt)
    )
    .limit(MAX_LISTED_PAPERS);
}

export async function countPendingPapers(db: Db) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(journalPapers)
    .where(eq(journalPapers.status, "pending"));
  return total;
}

export async function countPendingBy(db: Db, userId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(journalPapers)
    .where(
      and(eq(journalPapers.userId, userId), eq(journalPapers.status, "pending"))
    );
  return total;
}

export async function findPaper(db: Db, paperId: string): Promise<Paper | null> {
  const [paper] = await db
    .select()
    .from(journalPapers)
    .where(eq(journalPapers.id, paperId))
    .limit(1);
  return paper ?? null;
}

export async function findPaperFile(db: Db, paperId: string) {
  const [file] = await db
    .select({ data: journalFiles.data })
    .from(journalFiles)
    .where(eq(journalFiles.paperId, paperId))
    .limit(1);
  return file?.data ?? null;
}
