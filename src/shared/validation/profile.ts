import { z } from "zod";
import { optionalText, personName, phoneNumber, requiredText } from "./fields";

const MAX_LONG_TEXT = 4000;
const MAX_PHOTO_LENGTH = 400_000;
const PHOTO_DATA_URL =
  /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

export const profileSchema = z.object({
  fullName: personName,
  phone: phoneNumber,
  designation: requiredText("Designation is required"),
  institution: optionalText(),
  country: optionalText(),
  education: optionalText(MAX_LONG_TEXT),
  experience: optionalText(MAX_LONG_TEXT),
  publications: optionalText(MAX_LONG_TEXT),
  showInDirectory: z.boolean().default(true),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const photoSchema = z
  .string()
  .max(MAX_PHOTO_LENGTH, "This photo is too large")
  .regex(PHOTO_DATA_URL, "Please choose a JPG, PNG or WebP photo");
