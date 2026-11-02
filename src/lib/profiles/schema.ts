import { z } from "zod";

const MAX_NAME_LENGTH = 120;
const MAX_TEXT_LENGTH = 200;
const PHONE_PATTERN = /^\+?[0-9][0-9 ()-]{6,19}$/;

const optionalText = z
  .string()
  .trim()
  .max(MAX_TEXT_LENGTH, `Use at most ${MAX_TEXT_LENGTH} characters`)
  .transform((value) => value || undefined)
  .optional();

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(MAX_NAME_LENGTH, `Use at most ${MAX_NAME_LENGTH} characters`),
  phone: z.string().trim().regex(PHONE_PATTERN, "Enter a valid phone number"),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(MAX_NAME_LENGTH, `Use at most ${MAX_NAME_LENGTH} characters`),
  institution: optionalText,
  qualification: optionalText,
});

export type ProfileInput = z.infer<typeof profileSchema>;
