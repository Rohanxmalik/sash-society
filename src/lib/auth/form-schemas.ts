import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const emailField = z.email("Enter a valid email address");

const passwordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters`);

const passwordsMatch = (form: { password: string; confirmPassword: string }) =>
  form.password === form.confirmPassword;

const MISMATCH = { message: "Passwords do not match", path: ["confirmPassword"] };

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch, MISMATCH);

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

export const emailSchema = z.object({ email: emailField });

export const resetPasswordSchema = z
  .object({ password: passwordField, confirmPassword: z.string() })
  .refine(passwordsMatch, MISMATCH);
