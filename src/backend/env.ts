import { z } from "zod";

const MIN_SECRET_LENGTH = 32;
const PRODUCTION_ONLY_KEYS = [
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "CRON_SECRET",
] as const;

// Anything else gets the strict rules, so a stray NODE_ENV value can never turn
// on the fake gateway or the development mailer.
export const isLocalEnv = (nodeEnv: string | undefined) =>
  nodeEnv === "development" || nodeEnv === "test";

const blankToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalText = z.preprocess(blankToUndefined, z.string().optional());

const emailList = z
  .string()
  .optional()
  .transform((value) =>
    (value ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );

const envSchema = z
  .object({
    NODE_ENV: z.string().optional(),
    DATABASE_URL: z.preprocess(blankToUndefined, z.url()),
    BETTER_AUTH_SECRET: z.preprocess(
      blankToUndefined,
      z.string().min(MIN_SECRET_LENGTH)
    ),
    BETTER_AUTH_URL: z.preprocess(blankToUndefined, z.url()),
    RESEND_API_KEY: optionalText,
    EMAIL_FROM: optionalText,
    DEV_MAIL_FILE: optionalText,
    RAZORPAY_KEY_ID: optionalText,
    RAZORPAY_KEY_SECRET: optionalText,
    RAZORPAY_WEBHOOK_SECRET: optionalText,
    CRON_SECRET: optionalText,
    ADMIN_EMAILS: emailList,
  })
  .superRefine((env, context) => {
    if (isLocalEnv(env.NODE_ENV)) return;

    // Better Auth sets the Secure cookie flag from this URL alone.
    if (!env.BETTER_AUTH_URL.startsWith("https://")) {
      context.addIssue({
        code: "custom",
        path: ["BETTER_AUTH_URL"],
        message: "Must use https in production",
      });
    }

    if (env.ADMIN_EMAILS.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["ADMIN_EMAILS"],
        message: "Required in production",
      });
    }

    PRODUCTION_ONLY_KEYS.filter((key) => !env[key]).forEach((key) => {
      context.addIssue({
        code: "custom",
        path: [key],
        message: "Required in production",
      });
    });
  });

export type Env = z.infer<typeof envSchema>;

export function parseEnv(raw: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(raw);
  if (result.success) return result.data;

  const problems = result.error.issues.map(
    (issue) => `${issue.path.join(".")}: ${issue.message}`
  );
  throw new Error(`Invalid environment variables:\n${problems.join("\n")}`);
}

let cachedEnv: Env | undefined;

export function getEnv(): Env {
  cachedEnv ??= parseEnv(process.env);
  return cachedEnv;
}
