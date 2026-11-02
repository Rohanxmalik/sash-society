import { z } from "zod";
import {
  emailAddress,
  optionalText,
  personName,
  phoneNumber,
  requiredText,
} from "./fields";

export const eventRegistrationSchema = z.object({
  eventId: requiredText("Event is required"),
  optionId: requiredText("Choose how you will attend"),
  fullName: personName,
  email: emailAddress,
  whatsapp: phoneNumber,
  affiliation: requiredText("Affiliation is required", 200),
  designation: requiredText("Designation is required"),
  paperTitle: optionalText(300),
  subTheme: optionalText(),
});

export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
