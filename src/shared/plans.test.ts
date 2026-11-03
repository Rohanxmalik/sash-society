import { describe, expect, test } from "vitest";
import { memberTypeOf, membershipPlans } from "./plans";

describe("memberTypeOf", () => {
  test.each(["life-india", "life-south-asia", "life-abroad"])(
    "%s is a Life Member",
    (slug) => {
      expect(memberTypeOf(slug)).toBe("Life Member");
    }
  );

  test.each([
    ["ordinary", "Ordinary Member"],
    ["student", "Student Member"],
  ])("%s is shown as %s", (slug, label) => {
    expect(memberTypeOf(slug)).toBe(label);
  });

  test("every plan has a label for the members list", () => {
    for (const plan of membershipPlans) {
      expect(plan.memberType.length).toBeGreaterThan(0);
    }
  });

  test("an unknown plan falls back to Member", () => {
    expect(memberTypeOf("gold")).toBe("Member");
  });
});
