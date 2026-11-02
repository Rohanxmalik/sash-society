import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createEmailVerificationToken } from "better-auth/api";
import * as schema from "@/db/schema";
import type { Db } from "@/db/types";
import type { Email, SendEmail } from "@/lib/email/sender";
import {
  existingAccountEmail,
  passwordResetEmail,
  verificationEmail,
} from "@/lib/email/templates";
import { safeLogValue } from "@/lib/safe-log";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "./form-schemas";

const ONE_MINUTE = 60;
const FIVE_MINUTES = 300;
const VERIFY_EMAIL_PATH = "/verify-email?verified=1";

// Set here, not by the forms: a callbackURL on sign-in also redirects successful
// logins, and this is the only page that can report a failed verification.
function toVerifyPage(url: string) {
  const link = new URL(url);
  link.searchParams.set("callbackURL", VERIFY_EMAIL_PATH);
  return link.toString();
}

export type CreateAuthOptions = {
  db: Db;
  baseURL: string;
  secret: string;
  sendEmail: SendEmail;
  rateLimitEnabled: boolean;
};

export function createAuth({
  db,
  baseURL,
  secret,
  sendEmail,
  rateLimitEnabled,
}: CreateAuthOptions) {
  // Not awaited: response time must not reveal whether an account exists.
  const dispatch = (email: Email) => {
    sendEmail(email).catch((error) => {
      console.error("Failed to send auth email", {
        subject: email.subject,
        error: safeLogValue(error),
      });
    });
  };

  const resendVerification = async (email: string) => {
    const link = new URL("/api/auth/verify-email", baseURL);
    link.searchParams.set(
      "token",
      await createEmailVerificationToken(secret, email)
    );
    dispatch(verificationEmail(email, toVerifyPage(link.toString())));
  };

  return betterAuth({
    appName: "South Asian Sociological Society",
    baseURL,
    secret,
    database: drizzleAdapter(db, { provider: "pg", schema }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        dispatch(passwordResetEmail(user.email, url));
      },
      // The form always says a link was sent, so a repeat sign-up must send one.
      onExistingUserSignUp: async ({ user }) => {
        if (!user.emailVerified) return resendVerification(user.email);

        dispatch(
          existingAccountEmail(
            user.email,
            new URL("/forgot-password", baseURL).toString()
          )
        );
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      // Off on purpose. Whoever signed up chose the password and may not own this
      // address. Requiring a login means the real owner has to reset it, which
      // removes that password and its sessions before they can enter any details.
      autoSignInAfterVerification: false,
      sendVerificationEmail: async ({ user, url }) => {
        dispatch(verificationEmail(user.email, toVerifyPage(url)));
      },
    },
    rateLimit: {
      enabled: rateLimitEnabled,
      storage: "database",
      customRules: {
        "/sign-in/email": { window: ONE_MINUTE, max: 5 },
        "/sign-up/email": { window: ONE_MINUTE, max: 5 },
        "/request-password-reset": { window: FIVE_MINUTES, max: 3 },
        "/send-verification-email": { window: FIVE_MINUTES, max: 3 },
        // Called on every page view by the header.
        "/get-session": false,
      },
    },
    advanced: {
      // Set by Railway's edge. X-Forwarded-For chains are not trusted by default.
      ipAddress: { ipAddressHeaders: ["x-real-ip"] },
    },
    // throw hands unexpected errors to handleAuthRequest. Otherwise the router
    // writes them straight to console.error, query parameters included.
    onAPIError: { throw: true, errorURL: "/login" },
    logger: {
      log: (level, message, ...details) => {
        console[level]("[auth]", ...[message, ...details].map(safeLogValue));
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

export async function handleAuthRequest(auth: Auth, request: Request) {
  try {
    return await auth.handler(request);
  } catch (error) {
    console.error("[auth] Request failed", safeLogValue(error));
    return new Response(null, { status: 500 });
  }
}
