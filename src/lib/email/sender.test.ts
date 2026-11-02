import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createEmailSender } from "./sender";

const EMAIL = {
  to: "member@example.org",
  subject: "Verify your email",
  text: "Open https://example.org/verify",
  html: "<a href=\"https://example.org/verify\">Verify</a>",
};

const send = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

describe("createEmailSender with Resend", () => {
  beforeEach(() => send.mockReset());

  test("sends from the configured address", async () => {
    send.mockResolvedValue({ data: { id: "1" }, error: null, headers: null });
    const sendEmail = createEmailSender({
      resendApiKey: "re_123",
      from: "SASS <no-reply@example.org>",
    });

    await sendEmail(EMAIL);

    expect(send).toHaveBeenCalledWith({
      from: "SASS <no-reply@example.org>",
      to: EMAIL.to,
      subject: EMAIL.subject,
      text: EMAIL.text,
      html: EMAIL.html,
    });
  });

  test("rejects when Resend reports an error instead of throwing", async () => {
    send.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "Domain not verified", statusCode: 403 },
      headers: null,
    });
    const sendEmail = createEmailSender({
      resendApiKey: "re_123",
      from: "SASS <no-reply@example.org>",
    });

    await expect(sendEmail(EMAIL)).rejects.toThrow("Domain not verified");
  });
});

describe("createEmailSender without Resend", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "sash-mail-"));
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  test("appends each email to the outbox file", async () => {
    const outbox = join(dir, "outbox.jsonl");
    const sendEmail = createEmailSender({ devMailFile: outbox });

    await sendEmail(EMAIL);
    await sendEmail({ ...EMAIL, to: "second@example.org" });

    const lines = readFileSync(outbox, "utf8").trim().split("\n");
    expect(lines.map((line) => JSON.parse(line).to)).toEqual([
      "member@example.org",
      "second@example.org",
    ]);
  });

  test("does not call Resend", async () => {
    await createEmailSender({})(EMAIL);
    expect(send).not.toHaveBeenCalled();
  });
});
