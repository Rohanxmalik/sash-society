import { z } from "zod";

const MAX_NAME_LENGTH = 120;
const PHONE_PATTERN = /^\+?[0-9][0-9 ()-]{6,19}$/;
// Certificates are printed with fonts that only cover Latin letters.
const LATIN_NAME = /^[\p{Script=Latin}][\p{Script=Latin}\p{M} .,'’()-]*$/u;

const limited = (max: number) =>
  z.string().trim().max(max, `Use at most ${max} characters`);

export const requiredText = (message: string, max = MAX_NAME_LENGTH) =>
  limited(max).min(1, message);

export const optionalText = (max = 200) =>
  limited(max)
    .transform((value) => value || undefined)
    .optional();

export const personName = requiredText("Name is required").regex(
  LATIN_NAME,
  "Please use English letters. This name is printed on your documents."
);

export const phoneNumber = z
  .string()
  .trim()
  .regex(PHONE_PATTERN, "Enter a valid phone number");

export const emailAddress = z
  .email("Enter a valid email address")
  .max(254)
  .transform((value) => value.toLowerCase());
