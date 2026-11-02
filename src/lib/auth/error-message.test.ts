import { describe, expect, test } from "vitest";
import { authProblem } from "./error-message";

const GENERIC = "Something went wrong. Please try again.";

describe("authProblem", () => {
  test("returns null when the call succeeded", async () => {
    expect(await authProblem(Promise.resolve({ error: null }))).toBeNull();
  });

  test.each([
    [{ code: "INVALID_EMAIL_OR_PASSWORD", status: 401 }, "Incorrect email or password."],
    [{ code: "EMAIL_NOT_VERIFIED", status: 403 }, "Please verify your email first. We have sent you a new link."],
    [{ status: 429 }, "Too many attempts. Please wait a few minutes and try again."],
    [{ code: "SOMETHING_UNEXPECTED", status: 500 }, GENERIC],
  ])("explains %j", async (error, expected) => {
    expect(await authProblem(Promise.resolve({ error }))).toBe(expected);
  });

  test("handles a request that never reached the server", async () => {
    const offline = Promise.reject(new TypeError("Failed to fetch"));

    expect(await authProblem(offline)).toBe(GENERIC);
  });
});
