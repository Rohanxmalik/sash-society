import { z } from "zod";

const MIN_SECRET_LENGTH = 32;
const PRODUCTION_ONLY_KEYS = ["RESEND_API_KEY", "EMAIL_FROM"] as const;

const blankToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalText = z.preprocess(blankToUndefined, z.string().optional());

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
  })
  .superRefine((env, context) => {
    if (env.NODE_ENV !== "production") return;

    // Better Auth sets the Secure cookie flag from this URL alone.
    if (!env.BETTER_AUTH_URL.startsWith("https://")) {
      context.addIssue({
        code: "custom",
        path: ["BETTER_AUTH_URL"],
        message: "Must use https in production",
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
