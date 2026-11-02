import { describe, expect, test } from "vitest";
import {
  existingAccountEmail,
  passwordResetEmail,
  verificationEmail,
} from "./templates";

const URL_WITH_QUERY = "http://localhost:3000/api/auth/verify?token=abc&next=/account";

describe.each([
  ["verification", verificationEmail],
  ["password reset", passwordResetEmail],
  ["existing account", existingAccountEmail],
])("%s email", (_name, build) => {
  test("is addressed to the member", () => {
    expect(build("member@example.org", URL_WITH_QUERY).to).toBe(
      "member@example.org"
    );
  });

  test("carries the exact link in the text version", () => {
    expect(build("member@example.org", URL_WITH_QUERY).text).toContain(
      URL_WITH_QUERY
    );
  });

  test("encodes the link for use in an HTML attribute", () => {
    expect(build("member@example.org", URL_WITH_QUERY).html).toContain(
      'href="http://localhost:3000/api/auth/verify?token=abc&amp;next=/account"'
    );
  });

  test("cannot be broken out of by quotes in the link", () => {
    const { html } = build(
      "member@example.org",
      'http://localhost:3000/?x="><script>alert(1)</script>'
    );

    expect(html).not.toContain("<script>");
    expect(html).toContain("&quot;&gt;&lt;script&gt;");
  });
});
