import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTestDb, type TestDb } from "@/backend/test/test-db";
import {
  financialYear,
  nextMemberNumber,
  nextReceiptNumber,
  nextRegistrationNumber,
} from "./numbers";

let testDb: TestDb;

beforeEach(async () => {
  testDb = await createTestDb();
});

afterEach(async () => {
  await testDb.close();
});

describe("member numbers", () => {
  test("uses the plan code, year and a running number", async () => {
    const date = new Date("2026-11-02T10:00:00Z");

    expect(await nextMemberNumber(testDb.db, "LM", date, 1)).toBe(
      "SASS/LM/2026/0001"
    );
    expect(await nextMemberNumber(testDb.db, "ST", date, 1)).toBe(
      "SASS/ST/2026/0002"
    );
  });

  test("continues from the client's existing numbering", async () => {
    const date = new Date("2026-11-02T10:00:00Z");

    expect(await nextMemberNumber(testDb.db, "LM", date, 412)).toBe(
      "SASS/LM/2026/0412"
    );
  });
});

describe("receipt numbers", () => {
  test("restart each Indian financial year", async () => {
    const march = new Date("2027-03-31T10:00:00Z");
    const april = new Date("2027-04-01T10:00:00Z");

    expect(await nextReceiptNumber(testDb.db, march)).toBe(
      "SASS/R/2026-27/0001"
    );
    expect(await nextReceiptNumber(testDb.db, march)).toBe(
      "SASS/R/2026-27/0002"
    );
    expect(await nextReceiptNumber(testDb.db, april)).toBe(
      "SASS/R/2027-28/0001"
    );
  });
});

describe("registration numbers", () => {
  test("count separately for each event", async () => {
    expect(await nextRegistrationNumber(testDb.db, "MU27")).toBe(
      "SASS/MU27/0001"
    );
    expect(await nextRegistrationNumber(testDb.db, "MU27")).toBe(
      "SASS/MU27/0002"
    );
    expect(await nextRegistrationNumber(testDb.db, "XX28")).toBe(
      "SASS/XX28/0001"
    );
  });
});

describe("financialYear", () => {
  test.each([
    ["2026-04-01T00:00:00+05:30", "2026-27"],
    ["2027-03-31T23:00:00+05:30", "2026-27"],
    ["2099-12-31T00:00:00+05:30", "2099-00"],
  ])("puts %s in %s", (date, expected) => {
    expect(financialYear(new Date(date))).toBe(expected);
  });
});
