import { timingSafeEqual } from "node:crypto";
import { getEnv } from "@/backend/env";
import { runDailyJob } from "@/backend/jobs/daily";
import { getPaymentDeps } from "@/backend/runtime";

function hasValidSecret(request: Request, secret: string) {
  const sent = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return sent.length === expected.length && timingSafeEqual(sent, expected);
}

export async function POST(request: Request) {
  const secret = getEnv().CRON_SECRET;
  if (!secret || !hasValidSecret(request, secret)) {
    return new Response(null, { status: 401 });
  }

  return Response.json(await runDailyJob(getPaymentDeps()));
}
