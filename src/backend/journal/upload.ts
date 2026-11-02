import "server-only";
import { revalidatePath } from "next/cache";
import { getSession, isAdminEmail } from "@/backend/auth/session";
import { createRateLimiter } from "@/backend/rate-limit";
import { getPaymentDeps } from "@/backend/runtime";
import { MAX_JOURNAL_FILE_BYTES } from "@/shared/validation/journal";
import type { JournalResult } from "./deps";
import { withFileSlot } from "./file-gate";
import { fileTooLarge, type UploadedFile } from "./files";
import { addPublishedPaper } from "./review";
import { submitWork, whyCannotSubmit } from "./submit";

// The form adds a little on top of the file itself.
const MAX_REQUEST_BYTES = MAX_JOURNAL_FILE_BYTES + 1024 * 1024;
const ONE_HOUR_MS = 60 * 60 * 1000;
const NO_FILE = "Please attach a PDF or Word (.docx) file.";
const NOT_ALLOWED = "You do not have access to this.";
const SIGNED_OUT = "Please log in and try again.";

const allowSubmission = createRateLimiter({ limit: 5, windowMs: ONE_HOUR_MS });

const refuse = (status: number, message: string) =>
  Response.json({ ok: false, message }, { status });

const reply = (result: JournalResult) =>
  Response.json(result, { status: result.ok ? 200 : 400 });

function isTooLarge(request: Request) {
  const length = Number(request.headers.get("content-length"));
  return !length || length > MAX_REQUEST_BYTES;
}

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

const paperFields = (formData: FormData) => ({
  title: field(formData, "title"),
  authors: field(formData, "authors"),
  abstract: field(formData, "abstract"),
  articleType: field(formData, "articleType"),
});

async function readFile(formData: FormData): Promise<UploadedFile | null> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return null;
  return { name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) };
}

function refreshJournal() {
  revalidatePath("/journal");
  revalidatePath("/journal/archive");
  revalidatePath("/journal/submit");
  revalidatePath("/admin", "layout");
}

// A cut-off or malformed upload makes formData() throw.
const readForm = (request: Request) =>
  request.formData().catch(() => null);

const receiveUpload = (
  request: Request,
  save: (formData: FormData, file: UploadedFile) => Promise<JournalResult>
) =>
  withFileSlot(async () => {
    const formData = await readForm(request);
    if (!formData) return refuse(400, NO_FILE);

    const file = await readFile(formData);
    if (!file) return refuse(400, NO_FILE);

    const result = await save(formData, file);
    if (result.ok) refreshJournal();
    return reply(result);
  });

// Every check that can run without the file comes first, so nobody can make the
// server hold a large upload in memory without being allowed to send one.
export async function handleSubmissionUpload(request: Request) {
  const session = await getSession();
  if (!session) return refuse(401, SIGNED_OUT);

  const { user } = session;
  if (!allowSubmission(user.id)) {
    return refuse(429, "Too many submissions. Please try again later.");
  }
  if (isTooLarge(request)) return refuse(413, fileTooLarge());

  const deps = getPaymentDeps();
  const problem = await whyCannotSubmit(deps, user.id);
  if (problem) return refuse(403, problem);

  return receiveUpload(request, (formData, file) =>
    submitWork(
      deps,
      user,
      {
        ...paperFields(formData),
        declarationAccepted: field(formData, "declarationAccepted") === "on",
      },
      file
    )
  );
}

export async function handleBackIssueUpload(request: Request) {
  const session = await getSession();
  if (!session) return refuse(401, SIGNED_OUT);
  if (!isAdminEmail(session.user.email)) return refuse(403, NOT_ALLOWED);
  if (isTooLarge(request)) return refuse(413, fileTooLarge());

  return receiveUpload(request, (formData, file) =>
    addPublishedPaper(
      getPaymentDeps(),
      { ...paperFields(formData), publishedOn: field(formData, "publishedOn") },
      file,
      session.user.email
    )
  );
}
