export type Currency = "INR" | "USD";

const LOCALES: Record<Currency, string> = { INR: "en-IN", USD: "en-US" };

const majorUnits = (amountMinor: number) => amountMinor / 100;

export function formatMoney(amountMinor: number, currency: Currency): string {
  return new Intl.NumberFormat(LOCALES[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: amountMinor % 100 === 0 ? 0 : 2,
  }).format(majorUnits(amountMinor));
}

// PDF standard fonts have no rupee sign.
export function formatMoneyPlain(
  amountMinor: number,
  currency: Currency
): string {
  const amount = new Intl.NumberFormat(LOCALES[currency], {
    minimumFractionDigits: 2,
  }).format(majorUnits(amountMinor));
  return `${currency} ${amount}`;
}
