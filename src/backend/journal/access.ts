import "server-only";
import { isAdminEmail, requireSession } from "@/backend/auth/session";
import { getDb } from "@/backend/db";
import { createRateLimiter } from "@/backend/rate-limit";
import { withFileSlot } from "./file-gate";
import { findPaper, findPaperFile, type Paper } from "./repository";

const PDF_TYPE = "application/pdf";
const ONE_MINUTE_MS = 60 * 1000;

// Each read loads a whole file into memory.
const allowRead = createRateLimiter({ limit: 30, windowMs: ONE_MINUTE_MS });

const notFound = () => new Response(null, { status: 404 });

const canRead = (paper: Paper, user: { id: string; email: string }) =>
  paper.status === "published" ||
  paper.userId === user.id ||
  isAdminEmail(user.email);

// Missing and forbidden look the same, so ids cannot be probed.
export async function paperFileResponse(paperId: string) {
  const { user } = await requireSession();
  if (!allowRead(user.id)) return new Response(null, { status: 429 });

  const db = getDb();

  const paper = await findPaper(db, paperId);
  if (!paper || !canRead(paper, user)) return notFound();

  return withFileSlot(async () => {
    const data = await findPaperFile(db, paperId);
    if (!data) return notFound();

    // Word files always download, because browsers cannot show them safely.
    const disposition =
      paper.contentType === PDF_TYPE ? "inline" : "attachment";

    return new Response(data as BodyInit, {
      headers: {
        "content-type": paper.contentType,
        "content-disposition": `${disposition}; filename="${paper.fileName}"`,
        "cache-control": "private, no-store",
      },
    });
  });
}
