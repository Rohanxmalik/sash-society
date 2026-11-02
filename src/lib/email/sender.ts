import { appendFile } from "node:fs/promises";
import { Resend } from "resend";

export type Email = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type SendEmail = (email: Email) => Promise<void>;

type SenderConfig = {
  resendApiKey?: string;
  from?: string;
  devMailFile?: string;
};

export function createEmailSender({
  resendApiKey,
  from,
  devMailFile,
}: SenderConfig): SendEmail {
  if (resendApiKey && from) {
    const resend = new Resend(resendApiKey);

    return async (email) => {
      const { error } = await resend.emails.send({ from, ...email });
      if (error) throw new Error(`Resend rejected email: ${error.message}`);
    };
  }

  // parseEnv requires Resend in production, so this path is development only.
  return async (email) => {
    console.info(`[dev-mail] ${email.subject} -> ${email.to}\n${email.text}`);
    if (devMailFile) {
      await appendFile(devMailFile, `${JSON.stringify(email)}\n`);
    }
  };
}
