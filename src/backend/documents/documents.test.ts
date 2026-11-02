import { PDFDocument } from "pdf-lib";
import { describe, expect, test } from "vitest";
import { buildCertificatePdf } from "./certificate";
import { toPdfText } from "./pdf-helpers";
import { buildReceiptPdf } from "./receipt";

const RECEIPT = {
  title: "Payment Receipt",
  receiptNumber: "SASS/R/2026-27/0001",
  paidAt: new Date("2026-11-10T10:00:00Z"),
  billedTo: { name: "Asha Rao", email: "asha@example.org", phone: "+91 98765" },
  description: "Life Membership (India)",
  amountMinor: 1_000_000,
  currency: "INR" as const,
  paymentReference: "pay_abc",
};

const CERTIFICATE = {
  name: "Prof. Asha Rao",
  planName: "Life Membership (India)",
  memberNumber: "SASS/LM/2026/0001",
  issuedAt: new Date("2026-11-10T10:00:00Z"),
  expiresAt: null,
};

describe("buildReceiptPdf", () => {
  test("produces a one-page A4 document", async () => {
    const pdf = await PDFDocument.load(await buildReceiptPdf(RECEIPT));

    expect(pdf.getPageCount()).toBe(1);
    expect(Math.round(pdf.getPage(0).getWidth())).toBe(595);
    expect(pdf.getTitle()).toBe("Payment Receipt SASS/R/2026-27/0001");
  });

  test("copes with characters the PDF font lacks", async () => {
    await expect(
      buildReceiptPdf({
        ...RECEIPT,
        billedTo: { ...RECEIPT.billedTo, name: "Łukasz Şahin" },
      })
    ).resolves.toBeInstanceOf(Uint8Array);
  });
});

describe("buildCertificatePdf", () => {
  test("produces a one-page A4 landscape document", async () => {
    const pdf = await PDFDocument.load(await buildCertificatePdf(CERTIFICATE));

    expect(pdf.getPageCount()).toBe(1);
    expect(Math.round(pdf.getPage(0).getWidth())).toBe(842);
    expect(pdf.getTitle()).toBe("Certificate of Membership SASS/LM/2026/0001");
  });

  test("still fits a very long name", async () => {
    await expect(
      buildCertificatePdf({ ...CERTIFICATE, name: "A".repeat(120) })
    ).resolves.toBeInstanceOf(Uint8Array);
  });

  test("prints a validity date on plans that expire", async () => {
    await expect(
      buildCertificatePdf({
        ...CERTIFICATE,
        expiresAt: new Date("2027-11-09T23:59:59Z"),
      })
    ).resolves.toBeInstanceOf(Uint8Array);
  });
});

describe("toPdfText", () => {
  test.each([
    ["Asha Rao", "Asha Rao"],
    ["José Müller", "José Müller"],
    ["Łukasz Şahin", "Lukasz Sahin"],
    ["O’Neil", "O'Neil"],
    ["日本", "??"],
  ])("makes %s printable as %s", (input, expected) => {
    expect(toPdfText(input)).toBe(expected);
  });
});
