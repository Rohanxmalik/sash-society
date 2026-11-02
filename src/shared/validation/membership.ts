import { z } from "zod";
import { optionalText } from "./fields";

export const membershipCheckoutSchema = z.object({
  planSlug: z.string().min(1),
  declarationAccepted: z.literal(true, {
    error: "Please confirm that you meet the eligibility conditions",
  }),
  organisationName: optionalText(),
});

export type MembershipCheckoutInput = z.infer<typeof membershipCheckoutSchema>;
