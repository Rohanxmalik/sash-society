import {
  newSubmissionEmail,
  submissionReceivedEmail,
} from "@/backend/email/templates";
import { hasActiveMembership } from "@/backend/members/repository";
import { clientConfig } from "@/shared/client-config";
import { journalSubmissionSchema } from "@/shared/validation/journal";
import { sendQuietly, type JournalDeps, type JournalResult } from "./deps";
import { checkUpload, type UploadedFile } from "./files";
import { countPendingBy, storePaper } from "./repository";

// Files live in the database, so one account cannot be allowed to fill it.
const MAX_PENDING_PER_AUTHOR = 5;

const SUBMITTED =
  "Thank you. Your work has been sent for review, and we will email you the outcome.";

type Author = { id: string; name: string; email: string };

// Also runs before an upload is read, so it must not need the file.
export async function whyCannotSubmit(
  { db, now }: JournalDeps,
  authorId: string
): Promise<string | null> {
  if (!(await hasActiveMembership(db, authorId, now()))) {
    return "Only active members can submit work.";
  }

  const pending = await countPendingBy(db, authorId);
  return pending >= MAX_PENDING_PER_AUTHOR
    ? "You have several works under review. Please wait for a decision on those."
    : null;
}

export async function submitWork(
  deps: JournalDeps,
  author: Author,
  input: unknown,
  file: UploadedFile
): Promise<JournalResult> {
  const parsed = journalSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const problem = await whyCannotSubmit(deps, author.id);
  if (problem) return { ok: false, message: problem };

  const upload = checkUpload(file);
  if (!upload.ok) return upload;

  const { title, authors, abstract, articleType } = parsed.data;
  await storePaper(
    deps.db,
    {
      ...upload.file,
      userId: author.id,
      title,
      authors,
      abstract,
      articleType,
      status: "pending",
    },
    file.bytes
  );

  await sendQuietly(
    deps,
    submissionReceivedEmail({ to: author.email, name: author.name, title })
  );
  await sendQuietly(
    deps,
    newSubmissionEmail({
      to: clientConfig.society.email,
      authorName: author.name,
      authorEmail: author.email,
      title,
      reviewUrl: `${deps.baseURL}/admin/journal`,
    })
  );

  return { ok: true, message: SUBMITTED };
}
