import "server-only";
import { getDb } from "@/backend/db";
import { getEnv, isLocalEnv } from "@/backend/env";
import { getMailer } from "@/backend/runtime";
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
    rateLimitEnabled: !isLocalEnv(env.NODE_ENV),
    sendEmail: getMailer(),
  });
  return auth;
}

export function authRequestHandler(request: Request) {
  return handleAuthRequest(getAuth(), request);
}
