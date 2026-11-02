import { describe, expect, test } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  test.each([
    ["/profile", "/profile"],
    ["/profile/settings?tab=1", "/profile/settings?tab=1"],
    ["/membership?plan=life-india", "/membership?plan=life-india"],
  ])("keeps the internal path %s", (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected);
  });

  test.each([
    ["protocol-relative URL", "//evil.com"],
    ["backslash-protocol-relative URL", "/\\evil.com"],
    ["tab inside the slashes", "/\t/evil.com"],
    ["unparseable URL", "//"],
    ["absolute URL", "https://evil.com"],
    ["javascript URL", "javascript:alert(1)"],
    ["relative path", "profile"],
    ["empty string", ""],
    ["missing value", undefined],
    ["null value", null],
    ["repeated query parameter", ["/profile", "/other"]],
  ])("falls back to /profile for %s", (_label, input) => {
    expect(safeRedirectPath(input)).toBe("/profile");
  });

  test("uses the fallback the caller asks for", () => {
    expect(safeRedirectPath(undefined, "/membership")).toBe("/membership");
  });
});
