import { eq, sql } from "drizzle-orm";
import { counters } from "@/backend/db/schema";
import type { Db } from "@/backend/db/types";
import { safeLogValue } from "@/backend/safe-log";

const VISITS_KEY = "site-visits";
const SAVE_EVERY_MS = 60 * 60 * 1000;

// Visits are held in memory and saved in hourly batches. A write per visit would
// keep Neon awake and use up its free compute. A restart can lose up to an hour of
// unsaved visits, which is fine for a display counter. The first visit after a start
// is saved at once, as reading the total has woken Neon anyway, so the number still
// moves if the server restarts more often than hourly.
export function createVisitCounter({
  db,
  now = Date.now,
}: {
  db: Db;
  now?: () => number;
}) {
  let saved: number | undefined;
  let unsaved = 0;
  let lastSavedAt = Number.NEGATIVE_INFINITY;
  let saving = false;

  const load = async () => {
    if (saved !== undefined) return saved;

    const [row] = await db
      .select({ value: counters.value })
      .from(counters)
      .where(eq(counters.key, VISITS_KEY))
      .limit(1);
    saved = row?.value ?? 0;
    return saved;
  };

  const saveIfDue = async () => {
    if (saving || unsaved === 0 || now() - lastSavedAt < SAVE_EVERY_MS) return;

    saving = true;
    const batch = unsaved;
    try {
      const [row] = await db
        .insert(counters)
        .values({ key: VISITS_KEY, value: batch })
        .onConflictDoUpdate({
          target: counters.key,
          set: { value: sql`${counters.value} + ${batch}` },
        })
        .returning({ value: counters.value });
      saved = row.value;
      unsaved -= batch;
      lastSavedAt = now();
    } catch (error) {
      console.error("Failed to save visit count", safeLogValue(error));
    } finally {
      saving = false;
    }
  };

  const total = async () => (await load()) + unsaved;

  const record = async () => {
    unsaved += 1;
    await load();
    await saveIfDue();
    return total();
  };

  return { total, record };
}

export type VisitCounter = ReturnType<typeof createVisitCounter>;
