import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { clientConfig } from "@/shared/client-config";
import { formatDateIndia } from "@/shared/dates";
import { formatMoneyPlain, type Currency } from "@/shared/money";
import {
  embedPublicImage,
  GOLD,
  INK,
  MUTED,
  TEAL,
  toPdfText,
  wrapText,
} from "./pdf-helpers";

const A4_PORTRAIT: [number, number] = [595.28, 841.89];
const MARGIN = 50;
const LOGO_SIZE = 56;
const WHITE = rgb(1, 1, 1);

export interface ReceiptData {
  title: string;
  receiptNumber: string;
  paidAt: Date;
  billedTo: { name: string; email: string; phone?: string | null };
  description: string;
  amountMinor: number;
  currency: Currency;
  paymentReference: string;
}

export async function buildReceiptPdf(data: ReceiptData): Promise<Uint8Array> {
  const { society } = clientConfig;
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${data.title} ${data.receiptNumber}`);
  pdf.setAuthor(society.name);

  const page = pdf.addPage(A4_PORTRAIT);
  const [width, height] = A4_PORTRAIT;
  const right = width - MARGIN;
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const text = (
    value: string,
    x: number,
    y: number,
    size = 10,
    font = regular,
    color = INK
  ) => page.drawText(toPdfText(value), { x, y, size, font, color });

  const textRight = (
    value: string,
    edge: number,
    y: number,
    size = 10,
    font = regular,
    color = INK
  ) => {
    const printable = toPdfText(value);
    const x = edge - font.widthOfTextAtSize(printable, size);
    text(printable, x, y, size, font, color);
  };

  let y = height - MARGIN;

  const logo = await embedPublicImage(pdf, "images/logo.png");
  if (logo) {
    page.drawImage(logo, {
      x: MARGIN,
      y: y - LOGO_SIZE,
      width: LOGO_SIZE,
      height: LOGO_SIZE,
    });
  }

  const headerX = MARGIN + LOGO_SIZE + 14;
  text(society.name, headerX, y - 14, 15, bold, TEAL);
  wrapText(society.address, regular, 9, right - headerX).forEach(
    (line, index) => text(line, headerX, y - 30 - index * 12, 9, regular, MUTED)
  );
  y -= 76;
  text(`${society.email}  |  ${society.phone}`, headerX, y + 8, 9, regular, MUTED);
  if (society.gstin) {
    text(`GSTIN: ${society.gstin}`, headerX, y - 4, 9, regular, MUTED);
  }

  y -= 22;
  page.drawRectangle({
    x: MARGIN,
    y,
    width: width - MARGIN * 2,
    height: 2,
    color: GOLD,
  });

  y -= 36;
  text(data.title.toUpperCase(), MARGIN, y, 18, bold, TEAL);
  textRight(`No. ${data.receiptNumber}`, right, y + 2, 10, bold);
  y -= 16;
  textRight(`Date: ${formatDateIndia(data.paidAt)}`, right, y);

  y -= 34;
  text("Received from", MARGIN, y, 9, regular, MUTED);
  y -= 16;
  text(data.billedTo.name, MARGIN, y, 12, bold);
  y -= 15;
  text(data.billedTo.email, MARGIN, y);
  if (data.billedTo.phone) {
    y -= 14;
    text(data.billedTo.phone, MARGIN, y);
  }

  y -= 36;
  page.drawRectangle({
    x: MARGIN,
    y: y - 8,
    width: width - MARGIN * 2,
    height: 26,
    color: TEAL,
  });
  text("Description", MARGIN + 10, y, 10, bold, WHITE);
  textRight("Amount", right - 10, y, 10, bold, WHITE);

  const amount = formatMoneyPlain(data.amountMinor, data.currency);
  const rows = wrapText(data.description, regular, 11, 340);
  y -= 34;
  rows.forEach((line, index) => text(line, MARGIN + 10, y - index * 14, 11));
  textRight(amount, right - 10, y, 11);

  y -= 14 * rows.length + 8;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: right, y },
    thickness: 0.5,
    color: MUTED,
  });

  y -= 22;
  text("Total paid", right - 220, y, 12, bold);
  textRight(amount, right - 10, y, 12, bold, TEAL);

  y -= 44;
  text(`Payment reference: ${data.paymentReference}`, MARGIN, y, 9, regular, MUTED);
  y -= 13;
  text("Paid online through Razorpay.", MARGIN, y, 9, regular, MUTED);

  text(
    "This is a computer-generated document and does not need a signature.",
    MARGIN,
    MARGIN,
    8,
    regular,
    MUTED
  );

  return pdf.save();
}
