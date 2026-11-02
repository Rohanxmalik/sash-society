import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { payments } from "@/backend/db/schema";
import { addMember, createHarness, type Harness } from "@/backend/test/harness";
import {
  confirmPaymentAction,
  startEventCheckoutAction,
  startMembershipCheckoutAction,
} from "./actions";

const CHECKOUT_LIMIT = 10;

const mocks = vi.hoisted(() => ({
  requireSession: vi.fn(),
  getSession: vi.fn(),
  getPaymentDeps: vi.fn(),
  revalidatePath: vi.fn(),
  address: { current: "203.0.113.1" },
}));

vi.mock("@/backend/auth/session", () => ({
  requireSession: mocks.requireSession,
  getSession: mocks.getSession,
}));
vi.mock("@/backend/runtime", () => ({ getPaymentDeps: mocks.getPaymentDeps }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-real-ip": mocks.address.current }),
}));

const REGISTRATION = {
  eventId: "mauritius-2027",
  optionId: "online",
  fullName: "Asha Rao",
  email: "asha@example.org",
  whatsapp: "+91 98765 43210",
  affiliation: "University of Delhi",
  designation: "Assistant Professor",
};

let harness: Harness;

const checkout = () =>
  startMembershipCheckoutAction({
    planSlug: "student",
    declarationAccepted: true,
  });

beforeEach(async () => {
  harness = await createHarness();
  mocks.getPaymentDeps.mockReturnValue(harness.deps);
  mocks.getSession.mockResolvedValue(null);
  mocks.revalidatePath.mockClear();
});

afterEach(async () => {
  await harness.testDb.close();
});

describe("startMembershipCheckoutAction", () => {
  test("starts an order for the signed-in member", async () => {
    const member = await addMember(harness, "member-a");
    mocks.requireSession.mockResolvedValue({ user: member });

    const result = await checkout();

    expect(result.ok).toBe(true);
    const [payment] = await harness.testDb.db.select().from(payments);
    expect(payment.userId).toBe("member-a");
  });

  test("stops one member from creating endless orders", async () => {
    const member = await addMember(harness, "member-b");
    mocks.requireSession.mockResolvedValue({ user: member });

    for (let attempt = 0; attempt < CHECKOUT_LIMIT; attempt += 1) {
      expect((await checkout()).ok).toBe(true);
    }
    const blocked = await checkout();

    expect(blocked).toEqual({
      ok: false,
      message: expect.stringContaining("Too many attempts"),
    });
    expect(await harness.testDb.db.select().from(payments)).toHaveLength(
      CHECKOUT_LIMIT
    );
  });
});

describe("startEventCheckoutAction", () => {
  test("lets a guest register", async () => {
    mocks.address.current = "203.0.113.2";

    const result = await startEventCheckoutAction(REGISTRATION);

    expect(result.ok).toBe(true);
    const [payment] = await harness.testDb.db.select().from(payments);
    expect(payment.userId).toBeNull();
  });

  test("links the registration to a signed-in member", async () => {
    mocks.address.current = "203.0.113.3";
    await addMember(harness, "member-c");
    mocks.getSession.mockResolvedValue({ user: { id: "member-c" } });

    await startEventCheckoutAction(REGISTRATION);

    const [payment] = await harness.testDb.db.select().from(payments);
    expect(payment.userId).toBe("member-c");
  });

  test("limits each visitor without affecting others", async () => {
    mocks.address.current = "203.0.113.4";
    for (let attempt = 0; attempt < CHECKOUT_LIMIT; attempt += 1) {
      await startEventCheckoutAction({});
    }

    const blocked = await startEventCheckoutAction(REGISTRATION);
    mocks.address.current = "203.0.113.5";
    const someoneElse = await startEventCheckoutAction(REGISTRATION);

    expect(blocked.ok).toBe(false);
    expect(someoneElse.ok).toBe(true);
  });
});

describe("confirmPaymentAction", () => {
  test("refreshes the member's pages after a good payment", async () => {
    const member = await addMember(harness, "member-d");
    mocks.requireSession.mockResolvedValue({ user: member });
    const started = await checkout();
    if (!started.ok) throw new Error(started.message);

    const result = await confirmPaymentAction(started.order.fakeResponse);

    expect(result.ok).toBe(true);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/profile");
  });

  test("refuses a forged signature and refreshes nothing", async () => {
    const member = await addMember(harness, "member-e");
    mocks.requireSession.mockResolvedValue({ user: member });
    const started = await checkout();
    if (!started.ok) throw new Error(started.message);

    const result = await confirmPaymentAction({
      ...started.order.fakeResponse,
      signature: "forged",
    });

    expect(result.ok).toBe(false);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
