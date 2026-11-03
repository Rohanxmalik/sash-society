import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { journalFiles, journalPapers } from "@/backend/db/schema";
import {
  addLiveMembership,
  addMember,
  createHarness,
  type Harness,
} from "@/backend/test/harness";
import { MAX_JOURNAL_FILE_BYTES } from "@/shared/validation/journal";
import { submitWork } from "./submit";

const AUTHOR = { id: "user-1", name: "Asha Rao", email: "user-1@example.org" };
const WORK = {
  title: "Algorithms and Caste",
  authors: "Asha Rao",
  abstract: "How automated hiring tools treat caste.",
  articleType: "Research Article",
  declarationAccepted: true,
};
const PDF = { name: "paper.pdf", bytes: new TextEncoder().encode("%PDF-1.7 body") };
const MAX_PENDING = 5;

let harness: Harness;
const db = () => harness.testDb.db;
const submit = (work: unknown = WORK, file = PDF) =>
  submitWork(harness.deps, AUTHOR, work, file);

beforeEach(async () => {
  harness = await createHarness();
  await addMember(harness);
});

afterEach(async () => {
  await harness.testDb.close();
  vi.restoreAllMocks();
});

describe("submitWork for an active member", () => {
  beforeEach(async () => {
    await addLiveMembership(harness, "user-1");
  });

  test("keeps the work and its file, waiting for review", async () => {
    const result = await submit();

    expect(result.ok).toBe(true);
    const [paper] = await db().select().from(journalPapers);
    expect(paper).toMatchObject({
      userId: "user-1",
      title: WORK.title,
      status: "pending",
      fileName: "paper.pdf",
      contentType: "application/pdf",
      sizeBytes: PDF.bytes.length,
    });
    const [file] = await db().select().from(journalFiles);
    expect(Buffer.from(file.data).toString()).toBe("%PDF-1.7 body");
  });

  test("tells the author and the society", async () => {
    await submit();

    const recipients = harness.mail.map((mail) => mail.to);
    expect(recipients).toContain(AUTHOR.email);
    expect(recipients).toContain("info@sass-socio.org");
  });

  test("keeps the work even when the emails fail", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const deps = {
      ...harness.deps,
      sendEmail: async () => {
        throw new Error("Resend is down");
      },
    };

    const result = await submitWork(deps, AUTHOR, WORK, PDF);

    expect(result.ok).toBe(true);
    expect(await db().select().from(journalPapers)).toHaveLength(1);
  });

  test("refuses a file that is not a PDF or Word document", async () => {
    const result = await submit(WORK, {
      name: "paper.pdf",
      bytes: new Uint8Array([0x4d, 0x5a, 0x90, 0x00]),
    });

    expect(result.ok).toBe(false);
    expect(await db().select().from(journalPapers)).toHaveLength(0);
  });

  test("refuses a file that is too large", async () => {
    const bytes = new Uint8Array(MAX_JOURNAL_FILE_BYTES + 1);
    bytes.set(PDF.bytes);

    const result = await submit(WORK, { name: "paper.pdf", bytes });

    expect(result.ok).toBe(false);
    expect(await db().select().from(journalPapers)).toHaveLength(0);
  });

  test("asks for the details", async () => {
    const result = await submit({ ...WORK, title: " " });

    expect(result).toEqual({ ok: false, message: "Title is required" });
  });

  test("needs the declaration ticked", async () => {
    const result = await submit({ ...WORK, declarationAccepted: false });

    expect(result.ok).toBe(false);
  });

  test("only accepts the listed types of work", async () => {
    const result = await submit({ ...WORK, articleType: "Poem" });

    expect(result.ok).toBe(false);
  });

  test("limits how many works can wait for review at once", async () => {
    for (let count = 0; count < MAX_PENDING; count += 1) {
      expect((await submit()).ok).toBe(true);
    }

    const result = await submit();

    expect(result.ok).toBe(false);
    expect(await db().select().from(journalPapers)).toHaveLength(MAX_PENDING);
  });

  test("cleans up the file name", async () => {
    await submit(WORK, { ...PDF, name: "../../secret.pdf" });

    const [paper] = await db().select().from(journalPapers);
    expect(paper.fileName).toBe("secret.pdf");
  });
});

describe("submitWork for anyone else", () => {
  test("turns away an account with no membership", async () => {
    const result = await submit();

    expect(result.ok).toBe(false);
    expect(await db().select().from(journalPapers)).toHaveLength(0);
  });

  test("turns away a member still waiting for approval", async () => {
    await addLiveMembership(harness, "user-1", { status: "pending_approval" });

    expect((await submit()).ok).toBe(false);
  });

  test("turns away a member whose plan has lapsed", async () => {
    await addLiveMembership(harness, "user-1", {
      expiresAt: new Date("2026-01-01T00:00:00Z"),
    });

    expect((await submit()).ok).toBe(false);
  });
});
