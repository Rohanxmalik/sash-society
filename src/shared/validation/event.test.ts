import { describe, expect, test } from "vitest";
import { eventRegistrationSchema } from "./event";

const VALID = {
  eventId: "mauritius-2027",
  optionId: "offline",
  fullName: "Asha Rao",
  email: "asha@example.org",
  whatsapp: "+91 98765 43210",
  affiliation: "University of Delhi",
  designation: "Assistant Professor",
};

describe("eventRegistrationSchema", () => {
  test("accepts a form with no paper title", () => {
    expect(eventRegistrationSchema.safeParse(VALID).success).toBe(true);
  });

  test.each([
    ["fullName"],
    ["email"],
    ["whatsapp"],
    ["affiliation"],
    ["designation"],
    ["optionId"],
  ])("requires %s", (field) => {
    const result = eventRegistrationSchema.safeParse({ ...VALID, [field]: "" });

    expect(result.success).toBe(false);
  });

  test("lower-cases the email so duplicates are caught", () => {
    const parsed = eventRegistrationSchema.parse({
      ...VALID,
      email: "Asha@Example.ORG",
    });

    expect(parsed.email).toBe("asha@example.org");
  });

  test("stores a blank paper title as undefined", () => {
    const parsed = eventRegistrationSchema.parse({ ...VALID, paperTitle: " " });

    expect(parsed.paperTitle).toBeUndefined();
  });
});
