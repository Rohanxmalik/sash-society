import { describe, expect, test } from "vitest";
import { resetPasswordSchema, signupSchema } from "./form-schemas";

const SIGNUP = {
  name: "Asha Rao",
  email: "member@example.org",
  password: "correct-horse-battery",
  confirmPassword: "correct-horse-battery",
};

describe("signupSchema", () => {
  test("accepts a complete form", () => {
    expect(signupSchema.safeParse(SIGNUP).success).toBe(true);
  });

  test("puts a password mismatch on the confirm field", () => {
    const result = signupSchema.safeParse({
      ...SIGNUP,
      confirmPassword: "something-else",
    });

    expect(result.error?.issues[0].path).toEqual(["confirmPassword"]);
  });

  test.each([
    ["short password", { password: "short12", confirmPassword: "short12" }],
    ["invalid email", { email: "not-an-email" }],
    ["blank name", { name: "   " }],
  ])("rejects a %s", (_label, change) => {
    expect(signupSchema.safeParse({ ...SIGNUP, ...change }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  test("puts a password mismatch on the confirm field", () => {
    const result = resetPasswordSchema.safeParse({
      password: "correct-horse-battery",
      confirmPassword: "something-else",
    });

    expect(result.error?.issues[0].path).toEqual(["confirmPassword"]);
  });
});
