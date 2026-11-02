import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { journalPapers } from "@/backend/db/schema";
import type { PaperStatus } from "@/backend/db/schema";
import { addMember, createHarness, type Harness } from "@/backend/test/harness";
import {
  countPendingPapers,
  findPaper,
  listPapersForAdmin,
  listPublishedPapers,
  listSubmissionsBy,
} from "./repository";

let harness: Harness;
const db = () => harness.testDb.db;

async function addPaper(
  title: string,
  status: PaperStatus,
  overrides: Partial<typeof journalPapers.$inferInsert> = {}
) {
  const [paper] = await db()
    .insert(journalPapers)
    .values({
      title,
      status,
      authors: "Asha Rao",
      articleType: "Research Article",
      fileName: "paper.pdf",
      contentType: "application/pdf",
      sizeBytes: 100,
      ...overrides,
    })
    .returning();
  return paper;
}

beforeEach(async () => {
  harness = await createHarness();
  await addMember(harness);
  await addMember(harness, "user-2");
});

afterEach(async () => {
  await harness.testDb.close();
});

describe("listPublishedPapers", () => {
  test("shows only published work, newest first", async () => {
    await addPaper("Old", "published", {
      publishedAt: new Date("2024-01-01T00:00:00Z"),
    });
    await addPaper("New", "published", {
      publishedAt: new Date("2026-01-01T00:00:00Z"),
    });
    await addPaper("Waiting", "pending");
    await addPaper("Rejected", "rejected");
    await addPaper("Removed", "removed");

    const papers = await listPublishedPapers(db());

    expect(papers.map(({ title }) => title)).toEqual(["New", "Old"]);
  });

  test("can show just the latest few", async () => {
    await addPaper("One", "published", {
      publishedAt: new Date("2024-01-01T00:00:00Z"),
    });
    await addPaper("Two", "published", {
      publishedAt: new Date("2025-01-01T00:00:00Z"),
    });

    const papers = await listPublishedPapers(db(), 1);

    expect(papers.map(({ title }) => title)).toEqual(["Two"]);
  });

  test("leaves out the reviewer's private notes", async () => {
    await addPaper("One", "published", { reviewNote: "Private" });

    const [paper] = await listPublishedPapers(db());

    expect(paper).not.toHaveProperty("reviewNote");
    expect(paper).not.toHaveProperty("decidedBy");
  });
});

describe("listSubmissionsBy", () => {
  test("shows a member only their own work", async () => {
    await addPaper("Mine", "pending", { userId: "user-1" });
    await addPaper("Theirs", "pending", { userId: "user-2" });

    const papers = await listSubmissionsBy(db(), "user-1");

    expect(papers.map(({ title }) => title)).toEqual(["Mine"]);
  });
});

describe("listPapersForAdmin", () => {
  test("puts work waiting for review first, with who sent it", async () => {
    await addPaper("Done", "published", { userId: "user-1" });
    await addPaper("Waiting", "pending", { userId: "user-2" });

    const papers = await listPapersForAdmin(db());

    expect(papers[0]).toMatchObject({
      title: "Waiting",
      submitterEmail: "user-2@example.org",
    });
    expect(papers[1].title).toBe("Done");
  });

  test("includes back issues with no submitter", async () => {
    await addPaper("Back issue", "published");

    const [paper] = await listPapersForAdmin(db());

    expect(paper.submitterEmail).toBeNull();
  });
});

describe("countPendingPapers", () => {
  test("counts only work waiting for review", async () => {
    await addPaper("Waiting", "pending");
    await addPaper("Done", "published");

    expect(await countPendingPapers(db())).toBe(1);
  });
});

describe("findPaper", () => {
  test("finds a paper by id", async () => {
    const paper = await addPaper("One", "pending");

    expect((await findPaper(db(), paper.id))?.title).toBe("One");
  });

  test("returns nothing for an unknown id", async () => {
    expect(await findPaper(db(), "no-such-id")).toBeNull();
  });
});
