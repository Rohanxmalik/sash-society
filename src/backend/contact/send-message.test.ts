import { describe, expect, test, vi } from "vitest";
import type { Email } from "@/backend/email/sender";
import { sendContactMessage } from "./send-message";

const VALID = {
  firstName: "Asha",
  lastName: "Rao",
  email: "asha@example.org",
  subject: "Membership question",
  message: "Could you tell me more about the Life plan?",
};

function harness() {
  const mail: Email[] = [];
  return {
    mail,
    sendEmail: async (email: Email) => {
      mail.push(email);
    },
  };
}

describe("sendContactMessage", () => {
  test("emails the society with the visitor as reply-to", async () => {
    const { mail, sendEmail } = harness();

    const result = await sendContactMessage(sendEmail, VALID);

    expect(result).toEqual({ ok: true });
    expect(mail[0].to).toBe("info@sass-socio.org");
    expect(mail[0].replyTo).toBe("asha@example.org");
    expect(mail[0].text).toContain("Life plan");
  });

  test("rejects a message that is too short", async () => {
    const { mail, sendEmail } = harness();

    const result = await sendContactMessage(sendEmail, {
      ...VALID,
      message: "hi",
    });

    expect(result.ok).toBe(false);
    expect(mail).toHaveLength(0);
  });

  test("pretends to accept bots that fill the hidden field", async () => {
    const { mail, sendEmail } = harness();

    const result = await sendContactMessage(sendEmail, {
      ...VALID,
      website: "http://spam.example",
    });

    expect(result).toEqual({ ok: true });
    expect(mail).toHaveLength(0);
  });

  test("tells the visitor when the message could not be sent", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await sendContactMessage(async () => {
      throw new Error("Resend is down");
    }, VALID);

    expect(result.ok).toBe(false);
    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
  });
});
