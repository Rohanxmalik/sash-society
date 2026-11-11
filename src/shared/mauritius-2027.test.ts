import { describe, expect, test } from "vitest";
import { mauritius2027Details } from "./mauritius-2027";

const everyone = mauritius2027Details.committee.flatMap(({ members }) => members).join("\n");

describe("Mauritius 2027 committee", () => {
  test.each([
    "Dr. Mallayya S. (Karnataka)",
    "Dr. Mouneshwar Badiger (Karnataka)",
    "Dr. Jayashree Ambewadikar (Gujarat)",
    "Dr. Manoj Kumar Verma (BHU)",
    "Dr. Om Prakash Bhartiya (BHU)",
    "Prof. Mahesh Shukla (Madhya Pradesh)",
    "Barkatullah Univ.",
    "Hon. Dr. Reza Saumtally",
  ])("includes %s", (text) => {
    expect(everyone).toContain(text);
  });

  test.each(["Munshi", "Malaya", "Jayshree", "Barkatulla Univ.", "Hon Dr."])(
    "no longer includes %s",
    (text) => {
      expect(everyone).not.toContain(text);
    }
  );
});
