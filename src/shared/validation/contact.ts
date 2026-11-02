import { z } from "zod";
import { emailAddress, requiredText } from "./fields";

const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 5000;

export const contactSchema = z.object({
  firstName: requiredText("First name is required"),
  lastName: requiredText("Last name is required"),
  email: emailAddress,
  subject: requiredText("Subject is required", 200),
  message: z
    .string()
    .trim()
    .min(MIN_MESSAGE_LENGTH, "Message must be at least 10 characters")
    .max(MAX_MESSAGE_LENGTH),
  // Hidden from people. Bots fill it in.
  website: z.string().optional(),
});
