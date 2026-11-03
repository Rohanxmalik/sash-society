import { describe, expect, test } from "vitest";
import { photoSchema, profileSchema } from "./profile";

const VALID = {
  fullName: "Asha Rao",
  phone: "+91 98765 43210",
  designation: "Assistant Professor",
};

describe("profileSchema", () => {
  test("trims surrounding whitespace", () => {
    const parsed = profileSchema.parse({ ...VALID, fullName: "  Asha Rao  " });
    expect(parsed.fullName).toBe("Asha Rao");
  });

  test.each(["fullName", "phone", "designation"] as const)(
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

  test("rejects an oversized publications list", () => {
    const result = profileSchema.safeParse({
      ...VALID,
      publications: "x".repeat(4001),
    });
    expect(result.success).toBe(false);
  });

  test.each([
    ["https://asha.example.org", "https://asha.example.org"],
    ["http://asha.example.org/about", "http://asha.example.org/about"],
    ["  https://asha.example.org  ", "https://asha.example.org"],
    ["asha.example.org", "https://asha.example.org"],
    ["www.asha.example.org:8080/cv", "https://www.asha.example.org:8080/cv"],
  ])("accepts the website %s", (website, expected) => {
    expect(profileSchema.parse({ ...VALID, website }).website).toBe(expected);
  });

  test.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "java\tscript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "ftp://asha.example.org",
    "not a website",
    "localhost",
    `https://example.org/${"x".repeat(200)}`,
  ])("rejects the website %s", (website) => {
    expect(profileSchema.safeParse({ ...VALID, website }).success).toBe(false);
  });

  test("a website stays valid when the form and the server both check it", () => {
    const once = profileSchema.parse({ ...VALID, website: "asha.example.org" });

    expect(profileSchema.parse(once).website).toBe(once.website);
  });

  test("a website is optional", () => {
    expect(profileSchema.parse(VALID).website).toBeUndefined();
    expect(
      profileSchema.parse({ ...VALID, website: "   " }).website
    ).toBeUndefined();
  });

  test("drops fields it does not know", () => {
    const parsed = profileSchema.parse({ ...VALID, userId: "someone-else" });
    expect(parsed).not.toHaveProperty("userId");
  });

  test("lists a member in the directory unless they opt out", () => {
    expect(profileSchema.parse(VALID).showInDirectory).toBe(true);
    expect(
      profileSchema.parse({ ...VALID, showInDirectory: false }).showInDirectory
    ).toBe(false);
  });
});

describe("photoSchema", () => {
  const PIXEL = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

  test("accepts a small JPEG data URL", () => {
    expect(photoSchema.safeParse(PIXEL).success).toBe(true);
  });

  test.each([
    ["an SVG, which can carry scripts", "data:image/svg+xml;base64,PHN2Zz4="],
    ["an HTML document", "data:text/html;base64,PGh0bWw+"],
    ["a remote URL", "https://evil.example/x.png"],
    ["broken base64", "data:image/png;base64,###"],
  ])("rejects %s", (_label, value) => {
    expect(photoSchema.safeParse(value).success).toBe(false);
  });

  test("rejects an image that is too large", () => {
    const large = `data:image/jpeg;base64,${"A".repeat(400_001)}`;

    expect(photoSchema.safeParse(large).success).toBe(false);
  });
});
