import { describe, expect, test } from "vitest";
import { formatMoney, formatMoneyPlain } from "./money";

describe("formatMoney", () => {
  test.each([
    [1_000_000, "INR", "₹10,000"],
    [50_000, "INR", "₹500"],
    [125_000_000, "INR", "₹12,50,000"],
    [11_600, "USD", "$116"],
    [12_050, "USD", "$120.50"],
  ] as const)("formats %i %s", (amount, currency, expected) => {
    expect(formatMoney(amount, currency)).toBe(expected);
  });
});

describe("formatMoneyPlain", () => {
  test("spells out the currency, because PDF fonts have no rupee sign", () => {
    expect(formatMoneyPlain(1_000_000, "INR")).toBe("INR 10,000.00");
    expect(formatMoneyPlain(11_600, "USD")).toBe("USD 116.00");
  });
});
