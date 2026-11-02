import { describe, expect, test } from "vitest";
import { completeSignupSchema, resetPasswordSchema, signupSchema } from "./auth";

const SIGNUP = {
  name: "Asha Rao",
  phone: "+91 98765 43210",
  email: "member@example.org",
  designation: "Assistant Professor",
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
    ["bad phone", { phone: "call me" }],
    ["blank designation", { designation: "  " }],
    ["name not in English letters", { name: "आशा राव" }],
  ])("rejects a %s", (_label, change) => {
    expect(signupSchema.safeParse({ ...SIGNUP, ...change }).success).toBe(false);
  });

  test("accepts accented names", () => {
    expect(
      signupSchema.safeParse({ ...SIGNUP, name: "Prof. José O'Neil-Dürr" }).success
    ).toBe(true);
  });
});

describe("completeSignupSchema", () => {
  test("needs the phone, designation and password", () => {
    const result = completeSignupSchema.safeParse({ phone: "+91 98765 43210" });

    expect(result.success).toBe(false);
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
