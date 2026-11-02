import { PDFDocument, StandardFonts } from "pdf-lib";
import { clientConfig } from "@/shared/client-config";
import { formatDateIndia } from "@/shared/dates";
import {
  drawCentered,
  embedPublicImage,
  fitSize,
  GOLD,
  INK,
  MUTED,
  TEAL,
  toPdfText,
} from "./pdf-helpers";

const A4_LANDSCAPE: [number, number] = [841.89, 595.28];
const LOGO_SIZE = 68;
const SEAL_SIZE = 84;
const NAME_MAX_WIDTH = 640;
const SIGNATURE_HEIGHT = 40;
const SIGNATURE_LINE_Y = 104;
const SIGNATURE_LINE_WIDTH = 160;

export interface CertificateData {
  name: string;
  planName: string;
  memberNumber: string;
  issuedAt: Date;
  expiresAt: Date | null;
}

export async function buildCertificatePdf(
  data: CertificateData
): Promise<Uint8Array> {
  const { society, certificate } = clientConfig;
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${certificate.title} ${data.memberNumber}`);
  pdf.setAuthor(society.name);

  const page = pdf.addPage(A4_LANDSCAPE);
  const [width, height] = A4_LANDSCAPE;
  const roman = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const italic = await pdf.embedFont(StandardFonts.TimesRomanItalic);

  page.drawRectangle({
    x: 22,
    y: 22,
    width: width - 44,
    height: height - 44,
    borderColor: TEAL,
    borderWidth: 3,
  });
  page.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: GOLD,
    borderWidth: 1,
  });

  const logo = await embedPublicImage(pdf, "images/logo.png");
  if (logo) {
    page.drawImage(logo, {
      x: width / 2 - LOGO_SIZE / 2,
      y: height - 118,
      width: LOGO_SIZE,
      height: LOGO_SIZE,
    });
  }

  drawCentered(page, society.name, height - 150, {
    font: bold,
    size: 26,
    color: TEAL,
  });
  drawCentered(page, certificate.title.toUpperCase(), height - 182, {
    font: roman,
    size: 16,
    color: GOLD,
  });
  drawCentered(page, "This is to certify that", height - 222, {
    font: italic,
    size: 14,
    color: MUTED,
  });

  const name = toPdfText(data.name);
  const nameSize = fitSize(bold, name, 34, NAME_MAX_WIDTH);
  drawCentered(page, name, height - 266, {
    font: bold,
    size: nameSize,
    color: INK,
  });
  page.drawLine({
    start: { x: width / 2 - 200, y: height - 278 },
    end: { x: width / 2 + 200, y: height - 278 },
    thickness: 1,
    color: GOLD,
  });

  drawCentered(page, `${certificate.statement} ${society.name}`, height - 306, {
    font: roman,
    size: 14,
    color: INK,
  });
  drawCentered(
    page,
    `${certificate.categoryPrefix} ${data.planName}`,
    height - 328,
    { font: bold, size: 14, color: INK }
  );
  if (data.expiresAt) {
    drawCentered(
      page,
      `Valid until ${formatDateIndia(data.expiresAt)}`,
      height - 350,
      { font: italic, size: 12, color: MUTED }
    );
  }

  page.drawText(toPdfText(`Member No: ${data.memberNumber}`), {
    x: 70,
    y: SIGNATURE_LINE_Y + 16,
    size: 11,
    font: bold,
    color: INK,
  });
  page.drawText(`Date of issue: ${formatDateIndia(data.issuedAt)}`, {
    x: 70,
    y: SIGNATURE_LINE_Y,
    size: 11,
    font: roman,
    color: INK,
  });

  const seal = await embedPublicImage(pdf, "certificate/seal.png");
  if (seal) {
    page.drawImage(seal, {
      x: width / 2 - SEAL_SIZE / 2 - 40,
      y: 56,
      width: SEAL_SIZE,
      height: SEAL_SIZE,
    });
  }

  const { signatories } = certificate;
  await Promise.all(
    signatories.map(async (signatory, index) => {
      const centerX = width - 150 - (signatories.length - 1 - index) * 190;
      const signature = await embedPublicImage(
        pdf,
        `certificate/${signatory.signatureFile}`
      );

      if (signature) {
        const scaled = signature.scale(SIGNATURE_HEIGHT / signature.height);
        page.drawImage(signature, {
          x: centerX - scaled.width / 2,
          y: SIGNATURE_LINE_Y + 4,
          width: scaled.width,
          height: scaled.height,
        });
      }

      page.drawLine({
        start: { x: centerX - SIGNATURE_LINE_WIDTH / 2, y: SIGNATURE_LINE_Y },
        end: { x: centerX + SIGNATURE_LINE_WIDTH / 2, y: SIGNATURE_LINE_Y },
        thickness: 0.75,
        color: INK,
      });
      drawCentered(
        page,
        signatory.name,
        SIGNATURE_LINE_Y - 16,
        { font: bold, size: 11, color: INK },
        centerX
      );
      drawCentered(
        page,
        signatory.designation,
        SIGNATURE_LINE_Y - 30,
        { font: roman, size: 10, color: MUTED },
        centerX
      );
    })
  );

  return pdf.save();
}
