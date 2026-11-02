import type { SendEmail } from "@/backend/email/sender";
import { contactMessageEmail } from "@/backend/email/templates";
import { safeLogValue } from "@/backend/safe-log";
import { clientConfig } from "@/shared/client-config";
import { contactSchema } from "@/shared/validation/contact";

export type ContactResult = { ok: true } | { ok: false; message: string };

export async function sendContactMessage(
  sendEmail: SendEmail,
  input: unknown
): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const { website, ...message } = parsed.data;
  if (website) return { ok: true };

  try {
    await sendEmail(
      contactMessageEmail({ to: clientConfig.society.email, ...message })
    );
    return { ok: true };
  } catch (error) {
    console.error("Failed to send contact message", safeLogValue(error));
    return {
      ok: false,
      message: `We could not send your message. Please email ${clientConfig.society.email}.`,
    };
  }
}
