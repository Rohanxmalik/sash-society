import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { fulfilPayment } from "@/backend/payments/fulfil";
import { createEventOrder } from "@/backend/payments/orders";
import { addMember, createHarness, type Harness } from "@/backend/test/harness";
import { listMemberRegistrations } from "./repository";

let harness: Harness;

beforeEach(async () => {
  harness = await createHarness();
});

afterEach(async () => {
  await harness.testDb.close();
});

async function register(email: string, userId: string | null, paid = true) {
  const result = await createEventOrder(
    harness.deps,
    {
      eventId: "mauritius-2027",
      optionId: "online",
      fullName: "Asha Rao",
      email,
      whatsapp: "+91 98765 43210",
      affiliation: "University of Delhi",
      designation: "Assistant Professor",
    },
    userId
  );
  if (!result.ok) throw new Error(result.message);
  if (paid) {
    await fulfilPayment(harness.deps, {
      orderId: result.order.orderId,
      paymentId: harness.gateway.paymentIdFor(result.order),
    });
  }
}

describe("listMemberRegistrations", () => {
  test("lists the member's paid registration with its receipt", async () => {
    await addMember(harness);
    await register("user-1@example.org", "user-1");

    const [row] = await listMemberRegistrations(harness.testDb.db, "user-1");

    expect(row.eventId).toBe("mauritius-2027");
    expect(row.optionId).toBe("online");
    expect(row.registrationNumber).toBe("SASS/MU27/0001");
    expect(row.paymentId).toEqual(expect.any(String));
  });

  test("leaves out a registration that was never paid for", async () => {
    await addMember(harness);
    await register("user-1@example.org", "user-1", false);

    expect(await listMemberRegistrations(harness.testDb.db, "user-1")).toEqual([]);
  });

  test("leaves out other people's registrations", async () => {
    await addMember(harness);
    await addMember(harness, "user-2");
    await register("user-2@example.org", "user-2");
    await register("guest@example.org", null);

    expect(await listMemberRegistrations(harness.testDb.db, "user-1")).toEqual([]);
  });
});
