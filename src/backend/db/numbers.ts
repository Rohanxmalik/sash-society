import { sql } from "drizzle-orm";
import { counters } from "./schema";
import type { Db } from "./types";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const APRIL = 3;

const inIndia = (date: Date) => new Date(date.getTime() + IST_OFFSET_MS);
const padded = (value: number) => String(value).padStart(4, "0");

async function nextValue(db: Db, key: string, first = 1) {
  const [row] = await db
    .insert(counters)
    .values({ key, value: first })
    .onConflictDoUpdate({
      target: counters.key,
      set: { value: sql`${counters.value} + 1` },
    })
    .returning({ value: counters.value });
  return row.value;
}

export function financialYear(date: Date) {
  const local = inIndia(date);
  const startYear =
    local.getUTCMonth() >= APRIL
      ? local.getUTCFullYear()
      : local.getUTCFullYear() - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

export async function nextMemberNumber(
  db: Db,
  planCode: string,
  date: Date,
  firstNumber: number
) {
  const value = await nextValue(db, "member", firstNumber);
  return `SASS/${planCode}/${inIndia(date).getUTCFullYear()}/${padded(value)}`;
}

export async function nextReceiptNumber(db: Db, date: Date) {
  const year = financialYear(date);
  const value = await nextValue(db, `receipt-${year}`);
  return `SASS/R/${year}/${padded(value)}`;
}

export async function nextRegistrationNumber(db: Db, eventCode: string) {
  const value = await nextValue(db, `event-${eventCode}`);
  return `SASS/${eventCode}/${padded(value)}`;
}
