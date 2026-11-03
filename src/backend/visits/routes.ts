import "server-only";
import { clientAddress } from "@/backend/client-ip";
import { createRateLimiter } from "@/backend/rate-limit";
import { getVisitCounter } from "@/backend/runtime";
import { safeLogValue } from "@/backend/safe-log";

const AUTOMATED_VISITOR = /bot|crawl|spider|slurp|preview|headless/i;
const COUNTS_PER_ADDRESS_PER_HOUR = 20;
const HOUR_MS = 60 * 60 * 1000;

const allowCount = createRateLimiter({
  limit: COUNTS_PER_ADDRESS_PER_HOUR,
  windowMs: HOUR_MS,
});

async function respond(read: () => Promise<number>) {
  try {
    return Response.json(
      { total: await read() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to read visit count", safeLogValue(error));
    return Response.json({ total: null }, { status: 503 });
  }
}

export function visitTotalResponse() {
  return respond(() => getVisitCounter().total());
}

export function recordVisitResponse(request: Request) {
  const counter = getVisitCounter();
  const agent = request.headers.get("user-agent") ?? "";
  const counts =
    !AUTOMATED_VISITOR.test(agent) && allowCount(clientAddress(request.headers));

  return respond(() => (counts ? counter.record() : counter.total()));
}
