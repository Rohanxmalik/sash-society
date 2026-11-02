import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { journalFiles, journalPapers } from "@/backend/db/schema";
import {
  addLiveMembership,
  addMember,
  createHarness,
  NOW,
  type Harness,
} from "@/backend/test/harness";
import {
  addPublishedPaper,
  approvePaper,
  rejectPaper,
  removePaper,
} from "./review";
import { submitWork } from "./submit";

const ADMIN = "admin@example.org";
const AUTHOR = { id: "user-1", name: "Asha Rao", email: "user-1@example.org" };
const WORK = {
  title: "Algorithms and Caste",
  authors: "Asha Rao",
  abstract: "How automated hiring tools treat caste.",
  articleType: "Research Article",
  declarationAccepted: true,
};
const PDF = { name: "paper.pdf", bytes: new TextEncoder().encode("%PDF-1.7 body") };
const BACK_ISSUE = {
  title: "Explorations, Volume 8",
  authors: "SASS Editorial Board",
  articleType: "Research Article",
  publishedOn: "2025-04-01",
};

let harness: Harness;
const db = () => harness.testDb.db;

async function pendingPaper() {
  await submitWork(harness.deps, AUTHOR, WORK, PDF);
  harness.mail.length = 0;
  const [paper] = await db().select().from(journalPapers);
  return paper;
}

beforeEach(async () => {
  harness = await createHarness();
  await addMember(harness);
  await addLiveMembership(harness, "user-1");
});

afterEach(async () => {
  await harness.testDb.close();
  vi.restoreAllMocks();
});

describe("approvePaper", () => {
  test("publishes the work and records who approved it", async () => {
    const paper = await pendingPaper();

    const result = await approvePaper(harness.deps, paper.id, ADMIN);

    expect(result.ok).toBe(true);
    const [published] = await db().select().from(journalPapers);
    expect(published).toMatchObject({
      status: "published",
      publishedAt: NOW,
      decidedBy: ADMIN,
      decidedAt: NOW,
    });
  });

  test("tells the author, with a link to the journal", async () => {
    const paper = await pendingPaper();

    await approvePaper(harness.deps, paper.id, ADMIN);

    expect(harness.mail).toHaveLength(1);
    expect(harness.mail[0].to).toBe(AUTHOR.email);
    expect(harness.mail[0].text).toContain(WORK.title);
    expect(harness.mail[0].text).toContain("https://sass.example.org/journal");
  });

  test("stays published when the email fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const paper = await pendingPaper();
    const deps = {
      ...harness.deps,
      sendEmail: async () => {
        throw new Error("Resend is down");
      },
    };

    const result = await approvePaper(deps, paper.id, ADMIN);

    expect(result.ok).toBe(true);
    const [published] = await db().select().from(journalPapers);
    expect(published.status).toBe("published");
  });

  test("refuses a work that is no longer waiting", async () => {
    const paper = await pendingPaper();
    await rejectPaper(harness.deps, paper.id, "", ADMIN);

    const result = await approvePaper(harness.deps, paper.id, ADMIN);

    expect(result.ok).toBe(false);
    const [unchanged] = await db().select().from(journalPapers);
    expect(unchanged.status).toBe("rejected");
  });

  test("refuses an id that does not exist", async () => {
    expect((await approvePaper(harness.deps, "no-such-id", ADMIN)).ok).toBe(false);
  });
});

describe("rejectPaper", () => {
  test("rejects the work and passes the reason to the author", async () => {
    const paper = await pendingPaper();

    const result = await rejectPaper(
      harness.deps,
      paper.id,
      "Outside the journal's scope",
      ADMIN
    );

    expect(result.ok).toBe(true);
    const [rejected] = await db().select().from(journalPapers);
    expect(rejected).toMatchObject({
      status: "rejected",
      reviewNote: "Outside the journal's scope",
      decidedBy: ADMIN,
      publishedAt: null,
    });
    expect(harness.mail[0].text).toContain("Outside the journal's scope");
  });

  test("deletes the file, so rejected work does not fill the database", async () => {
    const paper = await pendingPaper();

    await rejectPaper(harness.deps, paper.id, "", ADMIN);

    expect(await db().select().from(journalFiles)).toHaveLength(0);
    expect(await db().select().from(journalPapers)).toHaveLength(1);
  });

  test("keeps the file when the work could not be rejected", async () => {
    const paper = await pendingPaper();
    await approvePaper(harness.deps, paper.id, ADMIN);

    await rejectPaper(harness.deps, paper.id, "", ADMIN);

    expect(await db().select().from(journalFiles)).toHaveLength(1);
  });

  test("works without a reason", async () => {
    const paper = await pendingPaper();

    const result = await rejectPaper(harness.deps, paper.id, "  ", ADMIN);

    expect(result.ok).toBe(true);
    const [rejected] = await db().select().from(journalPapers);
    expect(rejected.reviewNote).toBeNull();
  });

  test("cannot reject something already published", async () => {
    const paper = await pendingPaper();
    await approvePaper(harness.deps, paper.id, ADMIN);

    const result = await rejectPaper(harness.deps, paper.id, "", ADMIN);

    expect(result.ok).toBe(false);
    const [unchanged] = await db().select().from(journalPapers);
    expect(unchanged.status).toBe("published");
  });
});

describe("removePaper", () => {
  test("takes a published work down without emailing anyone", async () => {
    const paper = await pendingPaper();
    await approvePaper(harness.deps, paper.id, ADMIN);
    harness.mail.length = 0;

    const result = await removePaper(harness.deps, paper.id, ADMIN);

    expect(result.ok).toBe(true);
    const [removed] = await db().select().from(journalPapers);
    expect(removed.status).toBe("removed");
    expect(harness.mail).toHaveLength(0);
  });

  test("only applies to published work", async () => {
    const paper = await pendingPaper();

    expect((await removePaper(harness.deps, paper.id, ADMIN)).ok).toBe(false);
  });
});

describe("addPublishedPaper", () => {
  test("publishes a back issue straight away with its own date", async () => {
    const result = await addPublishedPaper(harness.deps, BACK_ISSUE, PDF, ADMIN);

    expect(result.ok).toBe(true);
    const [paper] = await db().select().from(journalPapers);
    expect(paper).toMatchObject({
      status: "published",
      userId: null,
      title: BACK_ISSUE.title,
      abstract: "",
      decidedBy: ADMIN,
    });
    expect(paper.publishedAt?.toISOString().slice(0, 10)).toBe("2025-04-01");
    expect(await db().select().from(journalFiles)).toHaveLength(1);
  });

  test("emails nobody", async () => {
    await addPublishedPaper(harness.deps, BACK_ISSUE, PDF, ADMIN);

    expect(harness.mail).toHaveLength(0);
  });

  test("refuses a file that is not a PDF or Word document", async () => {
    const result = await addPublishedPaper(
      harness.deps,
      BACK_ISSUE,
      { name: "paper.pdf", bytes: new Uint8Array([1, 2, 3, 4]) },
      ADMIN
    );

    expect(result.ok).toBe(false);
    expect(await db().select().from(journalPapers)).toHaveLength(0);
  });

  test("asks for the details", async () => {
    const result = await addPublishedPaper(
      harness.deps,
      { ...BACK_ISSUE, publishedOn: "last spring" },
      PDF,
      ADMIN
    );

    expect(result.ok).toBe(false);
  });
});
