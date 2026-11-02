import { describe, expect, test } from "vitest";
import { findEvent, isOptionOpen, openOption } from "./events";

const event = findEvent("mauritius-2027");
const offline = event?.registration?.options.find((o) => o.id === "offline");

describe("isOptionOpen", () => {
  test("stays open until the end of the last day in India", () => {
    // 25 Nov 23:30 IST
    expect(isOptionOpen(offline!, new Date("2026-11-25T18:00:00Z"))).toBe(true);
  });

  test("closes at midnight in India", () => {
    // 26 Nov 00:00 IST
    expect(isOptionOpen(offline!, new Date("2026-11-25T18:30:00Z"))).toBe(false);
  });
});

describe("openOption", () => {
  test("finds a fee option while it is open", () => {
    const option = openOption(event!, "offline", new Date("2026-11-20T00:00:00Z"));

    expect(option?.amountMinor).toBe(500_000);
  });

  test("returns nothing after that option has closed", () => {
    expect(
      openOption(event!, "offline", new Date("2026-12-01T00:00:00Z"))
    ).toBeUndefined();
  });

  test("keeps online registration open after offline closes", () => {
    const option = openOption(event!, "online", new Date("2026-12-01T00:00:00Z"));

    expect(option?.amountMinor).toBe(200_000);
  });

  test("returns nothing for an option that does not exist", () => {
    expect(
      openOption(event!, "vip", new Date("2026-11-20T00:00:00Z"))
    ).toBeUndefined();
  });
});
