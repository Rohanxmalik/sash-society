import { describe, expect, test } from "vitest";
import { profileSchema } from "./schema";

const VALID = {
  fullName: "Asha Rao",
  phone: "+91 98765 43210",
  country: "India",
};

describe("profileSchema", () => {
  test("trims surrounding whitespace", () => {
    const parsed = profileSchema.parse({ ...VALID, fullName: "  Asha Rao  " });
    expect(parsed.fullName).toBe("Asha Rao");
  });

  test.each(["fullName", "phone", "country"] as const)(
    "requires %s",
    (field) => {
      const result = profileSchema.safeParse({ ...VALID, [field]: "   " });
      expect(result.success).toBe(false);
    }
  );

  test.each(["123", "call me maybe", "+91<script>"])(
    "rejects the phone number %s",
    (phone) => {
      expect(profileSchema.safeParse({ ...VALID, phone }).success).toBe(false);
    }
  );

  test("stores blank optional fields as undefined", () => {
    const parsed = profileSchema.parse({ ...VALID, institution: "  " });
    expect(parsed.institution).toBeUndefined();
  });

  test("rejects an oversized value", () => {
    const result = profileSchema.safeParse({
      ...VALID,
      institution: "x".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  test("drops fields it does not know", () => {
    const parsed = profileSchema.parse({ ...VALID, userId: "someone-else" });
    expect(parsed).not.toHaveProperty("userId");
  });
});
