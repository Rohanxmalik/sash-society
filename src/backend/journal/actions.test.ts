import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { journalPapers } from "@/backend/db/schema";
import {
  addLiveMembership,
  addMember,
  createHarness,
  type Harness,
} from "@/backend/test/harness";
import {
  approvePaperAction,
  rejectPaperAction,
  removePaperAction,
} from "./actions";
import { submitWork } from "./submit";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getPaymentDeps: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT ${path}`);
  }),
}));

vi.mock("@/backend/auth/session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/backend/runtime", () => ({ getPaymentDeps: mocks.getPaymentDeps }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

const WORK = {
  title: "Algorithms and Caste",
  authors: "Asha Rao",
  abstract: "How automated hiring tools treat caste.",
  articleType: "Research Article",
  declarationAccepted: true,
};
const PDF = { name: "paper.pdf", bytes: new TextEncoder().encode("%PDF-1.7 body") };

function form(fields: Record<string, string>) {
  const data = new FormData();
  Object.entries(fields).forEach(([name, value]) => data.set(name, value));
  return data;
}

let harness: Harness;
const db = () => harness.testDb.db;

async function pendingPaper() {
  const member = await addMember(harness);
  await addLiveMembership(harness, member.id);
  await submitWork(harness.deps, member, WORK, PDF);
  const [paper] = await db().select().from(journalPapers);
  return paper;
}

beforeEach(async () => {
  harness = await createHarness();
  mocks.getPaymentDeps.mockReturnValue(harness.deps);
  mocks.requireAdmin.mockResolvedValue({
    user: { id: "admin", email: "admin@example.org" },
  });
});

afterEach(async () => {
  await harness.testDb.close();
});

describe("admin journal actions", () => {
  test.each([
    ["approve", approvePaperAction],
    ["reject", rejectPaperAction],
    ["remove", removePaperAction],
  ])("%s does nothing for a non-admin", async (_name, action) => {
    const paper = await pendingPaper();
    mocks.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(action(form({ paperId: paper.id }))).rejects.toThrow(
      "NEXT_REDIRECT"
    );

    const [unchanged] = await db().select().from(journalPapers);
    expect(unchanged.status).toBe("pending");
  });

  test("approving returns to the journal page with the outcome", async () => {
    const paper = await pendingPaper();

    await expect(
      approvePaperAction(form({ paperId: paper.id }))
    ).rejects.toThrow(/^REDIRECT \/admin\/journal\?notice=/);

    const [published] = await db().select().from(journalPapers);
    expect(published).toMatchObject({
      status: "published",
      decidedBy: "admin@example.org",
    });
  });

  test("rejecting passes the reason on", async () => {
    const paper = await pendingPaper();

    await expect(
      rejectPaperAction(form({ paperId: paper.id, reason: "Out of scope" }))
    ).rejects.toThrow(/REDIRECT/);

    const [rejected] = await db().select().from(journalPapers);
    expect(rejected.reviewNote).toBe("Out of scope");
  });

  test("removing takes a published work down", async () => {
    const paper = await pendingPaper();
    await expect(
      approvePaperAction(form({ paperId: paper.id }))
    ).rejects.toThrow(/REDIRECT/);

    await expect(
      removePaperAction(form({ paperId: paper.id }))
    ).rejects.toThrow(/REDIRECT/);

    const [removed] = await db().select().from(journalPapers);
    expect(removed.status).toBe("removed");
  });
});
