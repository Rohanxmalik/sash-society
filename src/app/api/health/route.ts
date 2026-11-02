import { sql } from "drizzle-orm";
import { getDb } from "@/backend/db";
import { safeLogValue } from "@/backend/safe-log";

// Railway waits for this before sending traffic to a new deployment.
export async function GET() {
  try {
    await getDb().execute(sql`select 1`);
    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed", safeLogValue(error));
    return Response.json({ status: "error" }, { status: 503 });
  }
}
