import { describe, expect, test } from "vitest";
import { initialsOf } from "./initials";

describe("initialsOf", () => {
  test("uses the first and last name, leaving out the title", () => {
    expect(initialsOf("Prof. Deendayal Bedia")).toBe("DB");
  });

  test("handles initials before the surname", () => {
    expect(initialsOf("Prof. R. N. Tripathi")).toBe("RT");
  });

  test("handles other titles and a single name", () => {
    expect(initialsOf("Dr. Mahesh")).toBe("M");
    expect(initialsOf("Prin. Preeti Sharma")).toBe("PS");
  });
});
