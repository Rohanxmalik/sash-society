import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";
import { proxy } from "./proxy";

const BASE_URL = "http://localhost:3000";

const requestFor = (path: string, cookie?: string) =>
  new NextRequest(`${BASE_URL}${path}`, {
    headers: cookie ? { cookie } : {},
  });

describe("proxy", () => {
  test("sends a visitor without a session cookie to login", () => {
    const res = proxy(requestFor("/account"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(`${BASE_URL}/login?next=%2Faccount`);
  });

  test("keeps the path and query in the return address", () => {
    const res = proxy(requestFor("/account/settings?tab=1"));

    const location = new URL(res.headers.get("location") ?? "");
    expect(location.searchParams.get("next")).toBe("/account/settings?tab=1");
  });

  test("lets a request with a session cookie through", () => {
    const res = proxy(
      requestFor("/account", "better-auth.session_token=abc.def")
    );

    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  test("recognises the secure cookie name used over HTTPS", () => {
    const res = proxy(
      requestFor("/account", "__Secure-better-auth.session_token=abc.def")
    );

    expect(res.headers.get("x-middleware-next")).toBe("1");
  });
});
