import {
  MAX_JOURNAL_FILE_BYTES,
  MAX_JOURNAL_FILE_MB,
} from "@/shared/validation/journal";

export type UploadedFile = { name: string; bytes: Uint8Array };

const MAX_NAME_LENGTH = 120;

// The extension alone proves nothing, so the opening bytes must match it too.
// The older .doc format is left out because it can carry macros.
const FILE_TYPES = [
  {
    extension: "pdf",
    contentType: "application/pdf",
    signature: [0x25, 0x50, 0x44, 0x46, 0x2d],
  },
  {
    extension: "docx",
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    signature: [0x50, 0x4b, 0x03, 0x04],
  },
];

export function identifyFile(name: string, bytes: Uint8Array) {
  const extension = name.toLowerCase().split(".").pop();
  const type = FILE_TYPES.find((candidate) => candidate.extension === extension);
  if (!type) return null;

  const matches = type.signature.every((byte, index) => bytes[index] === byte);
  return matches ? type : null;
}

// The name ends up in a download header, so only plain characters are kept.
export function safeFileName(name: string) {
  const base = name.split(/[\\/]/).pop() ?? "";
  const clean = base.replace(/[^\w .()-]/g, "_");
  if (clean.length <= MAX_NAME_LENGTH) return clean;

  const extension = clean.slice(clean.lastIndexOf("."));
  return clean.slice(0, MAX_NAME_LENGTH - extension.length) + extension;
}

export const fileTooLarge = () =>
  `This file is larger than ${MAX_JOURNAL_FILE_MB} MB.`;

export function checkUpload(file: UploadedFile) {
  if (file.bytes.length > MAX_JOURNAL_FILE_BYTES) {
    return { ok: false as const, message: fileTooLarge() };
  }

  const type = identifyFile(file.name, file.bytes);
  if (!type) {
    return {
      ok: false as const,
      message: "Please attach a PDF or Word (.docx) file.",
    };
  }

  return {
    ok: true as const,
    file: {
      fileName: safeFileName(file.name),
      contentType: type.contentType,
      sizeBytes: file.bytes.length,
    },
  };
}
