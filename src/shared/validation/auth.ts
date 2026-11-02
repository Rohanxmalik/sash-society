import { z } from "zod";
import { emailAddress, personName, phoneNumber, requiredText } from "./fields";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const passwordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters`);

const designationField = requiredText("Designation is required");

const passwordsMatch = (form: { password: string; confirmPassword: string }) =>
  form.password === form.confirmPassword;

const MISMATCH = { message: "Passwords do not match", path: ["confirmPassword"] };

export const signupSchema = z
  .object({
    name: personName,
    phone: phoneNumber,
    email: emailAddress,
    designation: designationField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch, MISMATCH);

// What the server still needs once the emailed code has created the account.
export const completeSignupSchema = z.object({
  phone: phoneNumber,
  designation: designationField,
  password: passwordField,
});

export const signupCodeSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const loginSchema = z.object({
  email: emailAddress,
  password: z.string().min(1, "Password is required"),
});

export const emailSchema = z.object({ email: emailAddress });

export const resetPasswordSchema = z
  .object({ password: passwordField, confirmPassword: z.string() })
  .refine(passwordsMatch, MISMATCH);
