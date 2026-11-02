import type { Email } from "@/backend/email/sender";
import type { PaymentDeps } from "@/backend/payments/deps";
import { safeLogValue } from "@/backend/safe-log";

export type JournalDeps = Pick<
  PaymentDeps,
  "db" | "sendEmail" | "baseURL" | "now"
>;

export type JournalResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

// A failed email must not undo the work it reports on. Resolves to whether it went.
export async function sendQuietly(
  { sendEmail }: JournalDeps,
  email: Email
): Promise<boolean> {
  try {
    await sendEmail(email);
    return true;
  } catch (error) {
    console.error("Failed to send journal email", {
      subject: email.subject,
      error: safeLogValue(error),
    });
    return false;
  }
}
