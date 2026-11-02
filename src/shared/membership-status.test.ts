import { describe, expect, test } from "vitest";
import { statusLabel } from "./membership-status";

describe("statusLabel", () => {
  test("uses plain words for a known status", () => {
    expect(statusLabel("pending_approval")).toBe("Waiting for approval");
  });

  test("says so when there is no membership", () => {
    expect(statusLabel(null)).toBe("No membership");
  });

  test("shows an unknown status as it is", () => {
    expect(statusLabel("paused")).toBe("paused");
  });
});
