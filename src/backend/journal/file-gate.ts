// A file costs about three times its size in memory while it passes through, and
// the Free server has 512 MB. Per-account limits do not stop many accounts at once.
const MAX_FILES_IN_MEMORY = 3;
const BUSY = "The site is busy. Please try again in a moment.";

let filesInMemory = 0;

export async function withFileSlot(work: () => Promise<Response>) {
  if (filesInMemory >= MAX_FILES_IN_MEMORY) {
    return Response.json({ ok: false, message: BUSY }, { status: 503 });
  }

  filesInMemory += 1;
  try {
    return await work();
  } finally {
    filesInMemory -= 1;
  }
}
