import type { MembershipStatus } from "@/backend/db/schema";

export type MembershipTerm = "from-joining" | "calendar-year";

const MONTHS_IN_YEAR = 12;
const INDIA_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Certificates print dates in India time, so a membership must end at the end of
// the day there. Ending at 23:59 UTC would print as the following morning.
const endOfDayInIndia = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month, day, 23, 59, 59) - INDIA_OFFSET_MS);

export function computeExpiry(
  plan: { durationMonths: number | null },
  start: Date,
  term: MembershipTerm
): Date | null {
  if (plan.durationMonths === null) return null;

  const startInIndia = new Date(start.getTime() + INDIA_OFFSET_MS);
  const year = startInIndia.getUTCFullYear();

  if (term === "calendar-year") {
    const years = plan.durationMonths / MONTHS_IN_YEAR;
    return endOfDayInIndia(year + years - 1, 11, 31);
  }

  return endOfDayInIndia(
    year,
    startInIndia.getUTCMonth() + plan.durationMonths,
    startInIndia.getUTCDate() - 1
  );
}

export function displayStatus(
  membership: { status: MembershipStatus; expiresAt: Date | null },
  now: Date
): MembershipStatus {
  const lapsed =
    membership.status === "active" &&
    membership.expiresAt !== null &&
    membership.expiresAt.getTime() < now.getTime();
  return lapsed ? "expired" : membership.status;
}
