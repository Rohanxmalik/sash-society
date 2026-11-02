import "server-only";
import { getDb } from "@/db";
import { createEmailSender } from "@/lib/email/sender";
import { getEnv } from "@/lib/env";
import { createAuth, handleAuthRequest, type Auth } from "./create-auth";

let auth: Auth | undefined;

// Built on first use so `next build` can run without runtime secrets.
export function getAuth(): Auth {
  if (auth) return auth;

  const env = getEnv();
  auth = createAuth({
    db: getDb(),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    rateLimitEnabled: env.NODE_ENV === "production",
    sendEmail: createEmailSender({
      resendApiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
      devMailFile: env.DEV_MAIL_FILE,
    }),
  });
  return auth;
}

export function authRequestHandler(request: Request) {
  return handleAuthRequest(getAuth(), request);
}
