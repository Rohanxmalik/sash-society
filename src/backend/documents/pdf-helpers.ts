import { readFile } from "node:fs/promises";
import path from "node:path";
import { rgb, type PDFDocument, type PDFFont, type PDFPage } from "pdf-lib";

export const TEAL = rgb(15 / 255, 76 / 255, 92 / 255);
export const GOLD = rgb(224 / 255, 180 / 255, 0);
export const INK = rgb(0.1, 0.1, 0.1);
export const MUTED = rgb(0.4, 0.4, 0.4);

const REPLACEMENTS: Record<string, string> = {
  Ł: "L",
  ł: "l",
  Đ: "D",
  đ: "d",
  ı: "i",
  "’": "'",
  "‘": "'",
  "“": '"',
  "”": '"',
  "–": "-",
  "—": "-",
};

const isPrintable = (char: string) =>
  (char >= " " && char <= "~") || (char >= " " && char <= "ÿ");

function toPrintable(char: string) {
  if (REPLACEMENTS[char]) return REPLACEMENTS[char];
  if (isPrintable(char)) return char;

  const base = char.normalize("NFKD").replace(/\p{M}/gu, "");
  return base.length === 1 && isPrintable(base) ? base : "?";
}

// The standard PDF fonts cover Western characters only, and throw on the rest.
export function toPdfText(text: string) {
  return [...text].map(toPrintable).join("");
}

export function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
) {
  return toPdfText(text)
    .split(" ")
    .reduce<string[]>((lines, word) => {
      const current = lines.at(-1);
      const joined = current ? `${current} ${word}` : word;
      return current === undefined ||
        font.widthOfTextAtSize(joined, size) > maxWidth
        ? [...lines, word]
        : [...lines.slice(0, -1), joined];
    }, []);
}

export function fitSize(
  font: PDFFont,
  text: string,
  maxSize: number,
  maxWidth: number
) {
  const width = font.widthOfTextAtSize(text, maxSize);
  return width <= maxWidth ? maxSize : (maxSize * maxWidth) / width;
}

export function drawCentered(
  page: PDFPage,
  rawText: string,
  y: number,
  options: { font: PDFFont; size: number; color: ReturnType<typeof rgb> },
  centerX: number = page.getWidth() / 2
) {
  const text = toPdfText(rawText);
  const width = options.font.widthOfTextAtSize(text, options.size);
  page.drawText(text, { ...options, x: centerX - width / 2, y });
}

// Optional artwork such as signatures and seals may not have been supplied yet.
export async function embedPublicImage(pdf: PDFDocument, publicPath: string) {
  try {
    const bytes = await readFile(path.join(process.cwd(), "public", publicPath));
    return publicPath.endsWith(".png")
      ? await pdf.embedPng(bytes)
      : await pdf.embedJpg(bytes);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
