import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getAuth } from "@/backend/auth";
import { getEnv } from "@/backend/env";

export const getSession = cache(async () => {
  // Read first: this is what marks the page dynamic, so `next build` never
  // reaches getAuth(), which needs runtime secrets.
  const requestHeaders = await headers();
  return getAuth().api.getSession({ headers: requestHeaders });
});

// Every server action and private page goes through this. The proxy only checks
// that a cookie exists; this validates it against the database.
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export const isAdminEmail = (email: string) =>
  getEnv().ADMIN_EMAILS.includes(email.toLowerCase());

export async function requireAdmin() {
  const session = await requireSession();
  if (!isAdminEmail(session.user.email)) redirect("/");
  return session;
}
