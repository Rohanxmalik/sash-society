import { describe, expect, test, vi } from "vitest";
import { sendContactMessageAction } from "./actions";

const MESSAGE_LIMIT = 5;

const mocks = vi.hoisted(() => ({
  sendEmail: vi.fn(async () => {}),
  address: { current: "203.0.113.1" },
}));

vi.mock("@/backend/runtime", () => ({ getMailer: () => mocks.sendEmail }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-real-ip": mocks.address.current }),
}));

const VALID = {
  firstName: "Asha",
  lastName: "Rao",
  email: "asha@example.org",
  subject: "Membership question",
  message: "Could you tell me more about the Life plan?",
};

describe("sendContactMessageAction", () => {
  test("sends the message to the society", async () => {
    const result = await sendContactMessageAction(VALID);

    expect(result.ok).toBe(true);
    expect(mocks.sendEmail).toHaveBeenCalledOnce();
  });

  test("limits each visitor without affecting others", async () => {
    mocks.address.current = "203.0.113.2";
    for (let attempt = 0; attempt < MESSAGE_LIMIT; attempt += 1) {
      await sendContactMessageAction(VALID);
    }

    const blocked = await sendContactMessageAction(VALID);
    mocks.address.current = "203.0.113.3";
    const someoneElse = await sendContactMessageAction(VALID);

    expect(blocked.ok).toBe(false);
    expect(someoneElse.ok).toBe(true);
  });
});
