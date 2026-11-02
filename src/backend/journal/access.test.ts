import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { journalFiles, journalPapers } from "@/backend/db/schema";
import type { PaperStatus } from "@/backend/db/schema";
import { addMember, createHarness, type Harness } from "@/backend/test/harness";
import { paperFileResponse } from "./access";

const READS_PER_MINUTE = 30;
const WORD_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const mocks = vi.hoisted(() => ({
  requireSession: vi.fn(),
  getDb: vi.fn(),
}));

vi.mock("@/backend/auth/session", () => ({
  requireSession: mocks.requireSession,
  isAdminEmail: (email: string) => email === "admin@example.org",
}));
vi.mock("@/backend/db", () => ({ getDb: mocks.getDb }));

let harness: Harness;

const signInAs = (id: string, email = `${id}@example.org`) =>
  mocks.requireSession.mockResolvedValue({ user: { id, email } });

async function addPaper(
  status: PaperStatus,
  overrides: Partial<typeof journalPapers.$inferInsert> = {}
) {
  const [paper] = await harness.testDb.db
    .insert(journalPapers)
    .values({
      status,
      userId: "owner",
      title: "Algorithms and Caste",
      authors: "Asha Rao",
      articleType: "Research Article",
      fileName: "paper.pdf",
      contentType: "application/pdf",
      sizeBytes: 13,
      ...overrides,
    })
    .returning();
  await harness.testDb.db.insert(journalFiles).values({
    paperId: paper.id,
    data: new TextEncoder().encode("%PDF-1.7 body"),
  });
  return paper;
}

beforeEach(async () => {
  harness = await createHarness();
  mocks.getDb.mockReturnValue(harness.testDb.db);
  await addMember(harness, "owner");
  signInAs("reader");
});

afterEach(async () => {
  await harness.testDb.close();
});

describe("paperFileResponse", () => {
  test("needs a login", async () => {
    mocks.requireSession.mockRejectedValue(new Error("NEXT_REDIRECT"));
    const paper = await addPaper("published");

    await expect(paperFileResponse(paper.id)).rejects.toThrow("NEXT_REDIRECT");
  });

  test("opens a published PDF for anyone logged in", async () => {
    const paper = await addPaper("published");

    const response = await paperFileResponse(paper.id);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain("inline");
    expect(await response.text()).toBe("%PDF-1.7 body");
  });

  test("downloads a Word document rather than opening it", async () => {
    const paper = await addPaper("published", {
      fileName: "paper.docx",
      contentType: WORD_TYPE,
    });

    const response = await paperFileResponse(paper.id);

    expect(response.headers.get("content-disposition")).toContain("attachment");
  });

  test("is never stored by a shared cache", async () => {
    const paper = await addPaper("published");

    const response = await paperFileResponse(paper.id);

    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  test.each(["pending", "rejected", "removed"] as const)(
    "hides %s work from other members",
    async (status) => {
      const paper = await addPaper(status);

      expect((await paperFileResponse(paper.id)).status).toBe(404);
    }
  );

  test("lets the author see their own unpublished work", async () => {
    const paper = await addPaper("pending");
    signInAs("owner");

    expect((await paperFileResponse(paper.id)).status).toBe(200);
  });

  test("lets an admin read work waiting for review", async () => {
    const paper = await addPaper("pending");
    signInAs("someone", "admin@example.org");

    expect((await paperFileResponse(paper.id)).status).toBe(200);
  });

  test("slows down one account hammering a file", async () => {
    const paper = await addPaper("published");
    signInAs("heavy-reader");

    for (let request = 0; request < READS_PER_MINUTE; request += 1) {
      expect((await paperFileResponse(paper.id)).status).toBe(200);
    }

    expect((await paperFileResponse(paper.id)).status).toBe(429);
  });

  test("gives nothing for an id that does not exist", async () => {
    expect((await paperFileResponse("no-such-id")).status).toBe(404);
  });
});
