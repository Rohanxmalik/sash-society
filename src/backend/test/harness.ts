import { memberships, profiles, user } from "@/backend/db/schema";
import type { Email } from "@/backend/email/sender";
import { createFakeGateway } from "@/backend/payments/fake-gateway";
import type { PaymentDeps } from "@/backend/payments/deps";
import { createTestDb, type TestDb } from "./test-db";

export const NOW = new Date("2026-11-10T10:00:00Z");

export type Harness = {
  testDb: TestDb;
  deps: PaymentDeps;
  mail: Email[];
  gateway: ReturnType<typeof createFakeGateway>;
};

export async function createHarness(): Promise<Harness> {
  const testDb = await createTestDb();
  const mail: Email[] = [];
  const gateway = createFakeGateway();

  return {
    testDb,
    mail,
    gateway,
    deps: {
      db: testDb.db,
      gateway,
      baseURL: "https://sass.example.org",
      now: () => NOW,
      sendEmail: async (email) => {
        mail.push(email);
      },
    },
  };
}

export async function addMember(
  { testDb }: Harness,
  id = "user-1",
  email = `${id}@example.org`
) {
  await testDb.db.insert(user).values({
    id,
    name: "Asha Rao",
    email,
    emailVerified: true,
  });
  await testDb.db.insert(profiles).values({
    userId: id,
    fullName: "Asha Rao",
    phone: "+91 98765 43210",
    designation: "Assistant Professor",
  });
  return { id, name: "Asha Rao", email };
}

export async function addLiveMembership(
  { testDb }: Harness,
  userId: string,
  overrides: Partial<typeof memberships.$inferInsert> = {}
) {
  const [row] = await testDb.db
    .insert(memberships)
    .values({
      userId,
      planSlug: "student",
      status: "active",
      startsAt: new Date("2026-01-01T00:00:00Z"),
      expiresAt: new Date("2026-12-31T23:59:59Z"),
      ...overrides,
    })
    .returning();
  return row;
}
