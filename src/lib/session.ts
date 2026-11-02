import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getAuth } from "@/lib/auth";

const getSession = cache(async () => {
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
