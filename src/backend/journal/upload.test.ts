import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { journalPapers } from "@/backend/db/schema";
import {
  addLiveMembership,
  addMember,
  createHarness,
  type Harness,
} from "@/backend/test/harness";
import { MAX_JOURNAL_FILE_BYTES } from "@/shared/validation/journal";
import { handleBackIssueUpload, handleSubmissionUpload } from "./upload";

const SUBMISSION_LIMIT = 5;

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  getPaymentDeps: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/backend/auth/session", () => ({
  getSession: mocks.getSession,
  isAdminEmail: (email: string) => email === "admin@example.org",
}));
vi.mock("@/backend/runtime", () => ({ getPaymentDeps: mocks.getPaymentDeps }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

const pdf = () =>
  new File(["%PDF-1.7 body"], "paper.pdf", { type: "application/pdf" });

const WORK = {
  title: "Algorithms and Caste",
  authors: "Asha Rao",
  abstract: "How automated hiring tools treat caste.",
  articleType: "Research Article",
  declarationAccepted: "on",
};

const BACK_ISSUE = {
  title: "Explorations, Volume 8",
  authors: "SASS Editorial Board",
  abstract: "",
  articleType: "Research Article",
  publishedOn: "2025-04-01",
};

async function uploadRequest(
  fields: Record<string, string | File>,
  contentLength?: string | null
) {
  const form = new FormData();
  Object.entries(fields).forEach(([name, value]) => form.set(name, value));

  const encoded = new Response(form);
  const body = await encoded.arrayBuffer();
  const length = contentLength === undefined ? String(body.byteLength) : contentLength;

  const request = new Request("http://localhost/api/uploads/journal", {
    method: "POST",
    headers: {
      "content-type": encoded.headers.get("content-type") ?? "",
      ...(length === null ? {} : { "content-length": length }),
    },
    body,
  });
  return { request, readBody: vi.spyOn(request, "formData") };
}

let harness: Harness;
const papers = () => harness.testDb.db.select().from(journalPapers);

async function signInMember(id: string) {
  const member = await addMember(harness, id);
  await addLiveMembership(harness, id);
  mocks.getSession.mockResolvedValue({ user: member });
}

beforeEach(async () => {
  harness = await createHarness();
  mocks.getPaymentDeps.mockReturnValue(harness.deps);
  mocks.getSession.mockReset();
  mocks.revalidatePath.mockClear();
});

afterEach(async () => {
  await harness.testDb.close();
});

describe("handleSubmissionUpload", () => {
  test("saves a member's work", async () => {
    await signInMember("member-a");
    const { request } = await uploadRequest({ ...WORK, file: pdf() });

    const response = await handleSubmissionUpload(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });
    expect(await papers()).toHaveLength(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/journal/submit");
  });

  test("refuses a signed-out visitor without reading the upload", async () => {
    mocks.getSession.mockResolvedValue(null);
    const { request, readBody } = await uploadRequest({ ...WORK, file: pdf() });

    const response = await handleSubmissionUpload(request);

    expect(response.status).toBe(401);
    expect(readBody).not.toHaveBeenCalled();
  });

  test("refuses a non-member without reading the upload", async () => {
    const account = await addMember(harness, "account-only");
    mocks.getSession.mockResolvedValue({ user: account });
    const { request, readBody } = await uploadRequest({ ...WORK, file: pdf() });

    const response = await handleSubmissionUpload(request);

    expect(response.status).toBe(403);
    expect(readBody).not.toHaveBeenCalled();
  });

  test("refuses an oversized upload without reading it", async () => {
    await signInMember("member-b");
    const { request, readBody } = await uploadRequest(
      { ...WORK, file: pdf() },
      String(MAX_JOURNAL_FILE_BYTES * 2)
    );

    const response = await handleSubmissionUpload(request);

    expect(response.status).toBe(413);
    expect(readBody).not.toHaveBeenCalled();
  });

  test("refuses an upload that does not state its size", async () => {
    await signInMember("member-c");
    const { request, readBody } = await uploadRequest(
      { ...WORK, file: pdf() },
      null
    );

    const response = await handleSubmissionUpload(request);

    expect(response.status).toBe(413);
    expect(readBody).not.toHaveBeenCalled();
  });

  test("asks for a file", async () => {
    await signInMember("member-d");
    const { request } = await uploadRequest(WORK);

    const response = await handleSubmissionUpload(request);

    expect(response.status).toBe(400);
    expect(await papers()).toHaveLength(0);
  });

  test("answers a malformed upload instead of crashing", async () => {
    await signInMember("member-h");
    const request = new Request("http://localhost/api/uploads/journal", {
      method: "POST",
      headers: {
        "content-type": "multipart/form-data; boundary=missing",
        "content-length": "10",
      },
      body: "not a form",
    });

    const response = await handleSubmissionUpload(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ ok: false });
  });

  test("reports a refused file so the form can show it", async () => {
    await signInMember("member-e");
    const notReallyPdf = new File(["plain text"], "paper.pdf");
    const { request } = await uploadRequest({ ...WORK, file: notReallyPdf });

    const response = await handleSubmissionUpload(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      ok: false,
      message: expect.stringContaining("PDF"),
    });
  });

  test("slows down repeated submissions from one member", async () => {
    await signInMember("member-f");
    for (let attempt = 0; attempt < SUBMISSION_LIMIT; attempt += 1) {
      const { request } = await uploadRequest(WORK);
      await handleSubmissionUpload(request);
    }

    const { request, readBody } = await uploadRequest({ ...WORK, file: pdf() });
    const response = await handleSubmissionUpload(request);

    expect(response.status).toBe(429);
    expect(readBody).not.toHaveBeenCalled();
  });
});

describe("handleBackIssueUpload", () => {
  const signInAdmin = () =>
    mocks.getSession.mockResolvedValue({
      user: { id: "admin", email: "admin@example.org" },
    });

  test("adds a back issue for an admin", async () => {
    signInAdmin();
    const { request } = await uploadRequest({ ...BACK_ISSUE, file: pdf() });

    const response = await handleBackIssueUpload(request);

    expect(response.status).toBe(200);
    const [paper] = await papers();
    expect(paper.status).toBe("published");
    expect(paper.decidedBy).toBe("admin@example.org");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/journal");
  });

  test("refuses a member without reading the upload", async () => {
    await signInMember("member-g");
    const { request, readBody } = await uploadRequest({
      ...BACK_ISSUE,
      file: pdf(),
    });

    const response = await handleBackIssueUpload(request);

    expect(response.status).toBe(403);
    expect(readBody).not.toHaveBeenCalled();
    expect(await papers()).toHaveLength(0);
  });

  test("refuses a signed-out visitor", async () => {
    mocks.getSession.mockResolvedValue(null);
    const { request } = await uploadRequest({ ...BACK_ISSUE, file: pdf() });

    expect((await handleBackIssueUpload(request)).status).toBe(401);
  });

  test("asks for a file", async () => {
    signInAdmin();
    const { request } = await uploadRequest(BACK_ISSUE);

    expect((await handleBackIssueUpload(request)).status).toBe(400);
  });

  test("refuses an oversized upload without reading it", async () => {
    signInAdmin();
    const { request, readBody } = await uploadRequest(
      { ...BACK_ISSUE, file: pdf() },
      String(MAX_JOURNAL_FILE_BYTES * 2)
    );

    expect((await handleBackIssueUpload(request)).status).toBe(413);
    expect(readBody).not.toHaveBeenCalled();
  });
});
