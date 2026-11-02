import { describe, expect, test } from "vitest";
import { formatDateIndia } from "@/shared/dates";
import { computeExpiry, displayStatus, type MembershipTerm } from "./rules";

const yearly = { durationMonths: 12 };
const fourYear = { durationMonths: 48 };
const life = { durationMonths: null };
const start = new Date("2026-03-05T10:00:00Z");

// Compared as printed, because that is the date a member sees on a certificate.
const printedExpiry = (
  plan: { durationMonths: number | null },
  from: Date,
  term: MembershipTerm
) => {
  const expiry = computeExpiry(plan, from, term);
  return expiry && formatDateIndia(expiry);
};

describe("computeExpiry", () => {
  test("a life plan never expires", () => {
    expect(computeExpiry(life, start, "from-joining")).toBeNull();
  });

  test("a yearly plan ends the day before the anniversary", () => {
    expect(printedExpiry(yearly, start, "from-joining")).toBe("4 March 2027");
  });

  test("a 4-year plan ends four years later", () => {
    expect(printedExpiry(fourYear, start, "from-joining")).toBe("4 March 2030");
  });

  test("calendar-year terms end on 31 December of the current year", () => {
    expect(printedExpiry(yearly, start, "calendar-year")).toBe(
      "31 December 2026"
    );
  });

  test("calendar-year 4-year terms cover four calendar years", () => {
    expect(printedExpiry(fourYear, start, "calendar-year")).toBe(
      "31 December 2029"
    );
  });

  test("uses the date in India for someone joining just after midnight", () => {
    const justAfterMidnightInIndia = new Date("2026-03-04T19:00:00Z");

    expect(
      printedExpiry(yearly, justAfterMidnightInIndia, "from-joining")
    ).toBe("4 March 2027");
  });

  test("a membership lasts until the end of its last day in India", () => {
    const expiresAt = computeExpiry(yearly, start, "from-joining");
    const lateThatNight = new Date("2027-03-04T18:00:00Z");
    const nextMorning = new Date("2027-03-05T00:00:00Z");

    expect(displayStatus({ status: "active", expiresAt }, lateThatNight)).toBe(
      "active"
    );
    expect(displayStatus({ status: "active", expiresAt }, nextMorning)).toBe(
      "expired"
    );
  });
});

describe("displayStatus", () => {
  const now = new Date("2027-01-01T00:00:00Z");

  test("shows a lapsed membership as expired before the nightly job runs", () => {
    expect(
      displayStatus(
        { status: "active", expiresAt: new Date("2026-12-31T23:59:59Z") },
        now
      )
    ).toBe("expired");
  });

  test("keeps a current membership active", () => {
    expect(
      displayStatus(
        { status: "active", expiresAt: new Date("2027-12-31T23:59:59Z") },
        now
      )
    ).toBe("active");
  });

  test("keeps a life membership active", () => {
    expect(displayStatus({ status: "active", expiresAt: null }, now)).toBe(
      "active"
    );
  });

  test("leaves other statuses alone", () => {
    expect(displayStatus({ status: "removed", expiresAt: null }, now)).toBe(
      "removed"
    );
  });
});
