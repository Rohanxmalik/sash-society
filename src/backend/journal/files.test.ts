import { describe, expect, test } from "vitest";
import { identifyFile, safeFileName } from "./files";

const bytes = (...values: number[]) => new Uint8Array(values);
const text = (value: string) => new TextEncoder().encode(value);

const PDF = text("%PDF-1.7 rest of the file");
const DOCX = bytes(0x50, 0x4b, 0x03, 0x04, 0x14, 0x00);
const DOC = bytes(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00);
const WINDOWS_PROGRAM = bytes(0x4d, 0x5a, 0x90, 0x00);

describe("identifyFile", () => {
  test("recognises a PDF", () => {
    expect(identifyFile("paper.pdf", PDF)?.contentType).toBe("application/pdf");
  });

  test("recognises a Word document", () => {
    expect(identifyFile("paper.docx", DOCX)?.contentType).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  });

  test("refuses the older Word format, which can carry macros", () => {
    expect(identifyFile("paper.doc", DOC)).toBeNull();
  });

  test("ignores capitals in the file name", () => {
    expect(identifyFile("PAPER.PDF", PDF)).not.toBeNull();
  });

  test("refuses a program renamed to look like a PDF", () => {
    expect(identifyFile("paper.pdf", WINDOWS_PROGRAM)).toBeNull();
  });

  test("refuses a file whose name and contents disagree", () => {
    expect(identifyFile("paper.docx", PDF)).toBeNull();
  });

  test("refuses other file types", () => {
    expect(identifyFile("paper.html", text("<script>alert(1)</script>"))).toBeNull();
  });

  test("refuses a file with no extension", () => {
    expect(identifyFile("paper", PDF)).toBeNull();
  });

  test("refuses an empty file", () => {
    expect(identifyFile("paper.pdf", bytes())).toBeNull();
  });
});

describe("safeFileName", () => {
  test("keeps an ordinary name", () => {
    expect(safeFileName("Caste and AI (2026).pdf")).toBe("Caste and AI (2026).pdf");
  });

  test("drops any folder path", () => {
    expect(safeFileName("../../etc/passwd.pdf")).toBe("passwd.pdf");
    expect(safeFileName("C:\\Users\\asha\\paper.pdf")).toBe("paper.pdf");
  });

  test("removes characters that could break a download header", () => {
    expect(safeFileName('a"b\r\nc.pdf')).toBe("a_b__c.pdf");
  });

  test("keeps the extension on a very long name", () => {
    const name = safeFileName(`${"a".repeat(300)}.docx`);

    expect(name.length).toBeLessThanOrEqual(120);
    expect(name.endsWith(".docx")).toBe(true);
  });
});
