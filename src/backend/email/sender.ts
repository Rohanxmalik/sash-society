import { appendFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";
import { hasRealEmail } from "@/shared/no-email";

export type EmailAttachment = { filename: string; content: Uint8Array };

export type Email = {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
};

export type SendEmail = (email: Email) => Promise<void>;

type SenderConfig = {
  resendApiKey?: string;
  from?: string;
  devMailFile?: string;
};

const DEV_ATTACHMENT_DIR = ".dev-mail";

async function keepDevAttachments(attachments: EmailAttachment[]) {
  await mkdir(DEV_ATTACHMENT_DIR, { recursive: true });
  return Promise.all(
    attachments.map(async ({ filename, content }) => {
      const file = path.join(DEV_ATTACHMENT_DIR, `${Date.now()}-${filename}`);
      await writeFile(file, content);
      return file;
    })
  );
}

export function createEmailSender({
  resendApiKey,
  from,
  devMailFile,
}: SenderConfig): SendEmail {
  if (resendApiKey && from) {
    const resend = new Resend(resendApiKey);

    return async ({ attachments, replyTo, ...email }) => {
      if (!hasRealEmail(email.to)) return;

      const { error } = await resend.emails.send({
        from,
        ...email,
        ...(replyTo ? { replyTo } : {}),
        ...(attachments?.length
          ? {
              attachments: attachments.map(({ filename, content }) => ({
                filename,
                content: Buffer.from(content),
              })),
            }
          : {}),
      });
      if (error) throw new Error(`Resend rejected email: ${error.message}`);
    };
  }

  // parseEnv requires Resend in production, so this path is development only.
  return async ({ attachments = [], ...email }) => {
    if (!hasRealEmail(email.to)) return;

    console.info(`[dev-mail] ${email.subject} -> ${email.to}\n${email.text}`);
    if (!devMailFile) return;

    const files = attachments.length
      ? await keepDevAttachments(attachments)
      : [];
    await appendFile(devMailFile, `${JSON.stringify({ ...email, files })}\n`);
  };
}
