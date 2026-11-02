import { DrizzleQueryError } from "drizzle-orm/errors";
import { describe, expect, test } from "vitest";
import { safeLogValue } from "./safe-log";

const failedQuery = () =>
  new DrizzleQueryError(
    'insert into "profiles" ("full_name", "phone") values ($1, $2)',
    ["Asha Rao", "+91 98765 43210"],
    Object.assign(new Error("duplicate key: Asha Rao"), { code: "23505" })
  );

describe("safeLogValue", () => {
  test("removes query parameters from a database error", () => {
    const logged = JSON.stringify(safeLogValue(failedQuery()));

    expect(logged).not.toContain("Asha Rao");
    expect(logged).not.toContain("98765");
  });

  test("keeps what is needed to diagnose a database error", () => {
    expect(safeLogValue(failedQuery())).toMatchObject({
      code: "23505",
      message: expect.stringContaining('insert into "profiles"'),
    });
  });

  test("removes query parameters from plain text", () => {
    const text = "Failed query: select 1\nparams: asha@example.org";

    expect(safeLogValue(text)).toBe("Failed query: select 1");
  });

  test("keeps the message of an ordinary error", () => {
    expect(safeLogValue(new TypeError("x is not a function"))).toMatchObject({
      name: "TypeError",
      message: "x is not a function",
    });
  });

  test("leaves ordinary text alone", () => {
    expect(safeLogValue("User not found")).toBe("User not found");
  });

  test("drops objects it cannot vouch for", () => {
    expect(safeLogValue({ email: "asha@example.org" })).toBe("[omitted]");
  });
});
