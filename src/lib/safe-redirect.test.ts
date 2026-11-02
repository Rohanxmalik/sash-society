import { describe, expect, test } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  test.each([
    ["/account", "/account"],
    ["/account/settings?tab=1", "/account/settings?tab=1"],
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
    ["relative path", "account"],
    ["empty string", ""],
    ["missing value", undefined],
    ["null value", null],
    ["repeated query parameter", ["/account", "/other"]],
  ])("falls back to /account for %s", (_label, input) => {
    expect(safeRedirectPath(input)).toBe("/account");
  });
});
