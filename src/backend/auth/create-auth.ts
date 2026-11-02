import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP } from "better-auth/plugins";
import * as schema from "@/backend/db/schema";
import type { Db } from "@/backend/db/types";
import type { Email, SendEmail } from "@/backend/email/sender";
import {
  passwordResetEmail,
  signupCodeEmail,
} from "@/backend/email/templates";
import { createRateLimiter } from "@/backend/rate-limit";
import { safeLogValue } from "@/backend/safe-log";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/shared/validation/auth";

const ONE_MINUTE = 60;
const FIVE_MINUTES = 300;
const TEN_MINUTES = 600;
const CODE_LENGTH = 6;
const REMOVED_MESSAGE =
  "This account has been removed. Please contact the society.";

// Everything the site does not use. Fewer open doors, and profile changes stay
// behind the validation in saveProfileAction.
const UNUSED_PATHS = [
  "/update-user",
  "/change-email",
  "/delete-user",
  "/send-verification-email",
  "/verify-email",
  "/email-otp/verify-email",
  "/email-otp/check-verification-otp",
  "/email-otp/request-password-reset",
  "/email-otp/reset-password",
  "/email-otp/request-email-change",
  "/email-otp/change-email",
  "/forget-password/email-otp",
];

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
  const allowCodeEmail = createRateLimiter({
    limit: 1,
    windowMs: ONE_MINUTE * 1000,
  });

  // Not awaited: response time must not reveal whether an account exists.
  const dispatch = (email: Email) => {
    sendEmail(email).catch((error) => {
      console.error("Failed to send auth email", {
        subject: email.subject,
        error: safeLogValue(error),
      });
    });
  };

  return betterAuth({
    appName: "South Asian Sociological Society",
    baseURL,
    secret,
    database: drizzleAdapter(db, { provider: "pg", schema }),
    disabledPaths: UNUSED_PATHS,
    emailAndPassword: {
      enabled: true,
      // Accounts only come from an emailed code, so nobody can register someone
      // else's address and keep a password on it.
      disableSignUp: true,
      requireEmailVerification: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        dispatch(passwordResetEmail(user.email, url));
      },
    },
    rateLimit: {
      enabled: rateLimitEnabled,
      storage: "database",
      customRules: {
        "/sign-in/email": { window: ONE_MINUTE, max: 5 },
        "/sign-in/email-otp": { window: ONE_MINUTE, max: 5 },
        "/email-otp/send-verification-otp": { window: FIVE_MINUTES, max: 5 },
        "/request-password-reset": { window: FIVE_MINUTES, max: 3 },
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
    plugins: [
      admin({ bannedUserMessage: REMOVED_MESSAGE }),
      emailOTP({
        otpLength: CODE_LENGTH,
        expiresIn: TEN_MINUTES,
        // Encrypted rather than hashed, because reuse has to read it back.
        storeOTP: "encrypted",
        resendStrategy: "reuse",
        rateLimit: { window: FIVE_MINUTES, max: 5 },
        sendVerificationOTP: async ({ email, otp }) => {
          if (rateLimitEnabled && !allowCodeEmail(email)) return;
          dispatch(signupCodeEmail(email, otp));
        },
      }),
    ],
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
