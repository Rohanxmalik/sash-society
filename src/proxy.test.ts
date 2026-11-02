import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";
import { config, proxy } from "./proxy";

const BASE_URL = "http://localhost:3000";

const requestFor = (path: string, cookie?: string) =>
  new NextRequest(`${BASE_URL}${path}`, {
    headers: cookie ? { cookie } : {},
  });

describe("proxy", () => {
  test("sends a visitor without a session cookie to login", () => {
    const res = proxy(requestFor("/profile"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(`${BASE_URL}/login?next=%2Fprofile`);
  });

  test("keeps the path and query in the return address", () => {
    const res = proxy(requestFor("/profile/settings?tab=1"));

    const location = new URL(res.headers.get("location") ?? "");
    expect(location.searchParams.get("next")).toBe("/profile/settings?tab=1");
  });

  test("lets a request with a session cookie through", () => {
    const res = proxy(
      requestFor("/profile", "better-auth.session_token=abc.def")
    );

    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  test("recognises the secure cookie name used over HTTPS", () => {
    const res = proxy(
      requestFor("/profile", "__Secure-better-auth.session_token=abc.def")
    );

    expect(res.headers.get("x-middleware-next")).toBe("1");
  });
});

describe("proxy matcher", () => {
  test("covers the profile and admin areas", () => {
    expect(config.matcher).toEqual(["/profile/:path*", "/admin/:path*"]);
  });
});
