import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Fast redirect for signed-out visitors only. This does not prove the cookie is
// valid; pages and actions must still call requireSession().
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const login = new URL("/login", request.url);
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/admin/:path*",
    "/journal/submit",
    "/api/journal/:path*",
  ],
};
