import { z } from "zod";

const MAX_NAME_LENGTH = 120;
const MAX_WEBSITE_LENGTH = 200;
const PHONE_PATTERN = /^\+?[0-9][0-9 ()-]{6,19}$/;
// No dot allowed, so "example.org:8080" reads as a host and not as a scheme.
const URL_SCHEME = /^[a-z][a-z0-9+-]*:/i;
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

function isWebAddress(value: string) {
  try {
    const { protocol, hostname } = new URL(value);
    return ["http:", "https:"].includes(protocol) && hostname.includes(".");
  } catch {
    return false;
  }
}

// Only http and https, because a saved address may be shown as a link and a
// javascript: address would then run in the browser of whoever clicks it.
export const optionalWebsite = limited(MAX_WEBSITE_LENGTH)
  .transform((value) =>
    value && !URL_SCHEME.test(value) ? `https://${value}` : value
  )
  .refine(
    (value) => !value || isWebAddress(value),
    "Enter a valid website address"
  )
  .transform((value) => value || undefined)
  .optional();

export const emailAddress = z
  .email("Enter a valid email address")
  .max(254)
  .transform((value) => value.toLowerCase());
