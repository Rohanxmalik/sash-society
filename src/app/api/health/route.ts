import { sql } from "drizzle-orm";
import { getDb } from "@/backend/db";
import { safeLogValue } from "@/backend/safe-log";

// For checking the database by hand. Render polls /api/ping, not this: see the note
// in that route.
export async function GET() {
  try {
    await getDb().execute(sql`select 1`);
    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed", safeLogValue(error));
    return Response.json({ status: "error" }, { status: 503 });
  }
}
