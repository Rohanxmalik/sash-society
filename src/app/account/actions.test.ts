import { inspect } from "node:util";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { user } from "@/db/schema";
import { findProfile } from "@/lib/profiles/repository";
import { createTestDb, type TestDb } from "@/test/test-db";
import { saveProfileAction } from "./actions";

const mocks = vi.hoisted(() => ({
  requireSession: vi.fn(),
  getDb: vi.fn(),
}));

vi.mock("@/lib/session", () => ({ requireSession: mocks.requireSession }));
vi.mock("@/db", () => ({ getDb: mocks.getDb }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const VALID = {
  fullName: "Asha Rao",
  phone: "+91 98765 43210",
  country: "India",
};

let testDb: TestDb;

beforeEach(async () => {
  testDb = await createTestDb();
  await testDb.db.insert(user).values([
    { id: "member", name: "Member", email: "member@example.org" },
    { id: "victim", name: "Victim", email: "victim@example.org" },
  ]);
  mocks.getDb.mockReturnValue(testDb.db);
  mocks.requireSession.mockResolvedValue({ user: { id: "member" } });
});

afterEach(async () => {
  await testDb.close();
  vi.restoreAllMocks();
});

describe("saveProfileAction", () => {
  test("saves the profile for the signed-in member", async () => {
    const result = await saveProfileAction(VALID);

    expect(result).toEqual({ ok: true });
    expect((await findProfile(testDb.db, "member"))?.fullName).toBe("Asha Rao");
  });

  test("ignores a user id sent in the form", async () => {
    await saveProfileAction({ ...VALID, userId: "victim" });

    expect(await findProfile(testDb.db, "victim")).toBeNull();
  });

  test("writes nothing when the session check rejects", async () => {
    mocks.requireSession.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(saveProfileAction(VALID)).rejects.toThrow("NEXT_REDIRECT");

    expect(await findProfile(testDb.db, "member")).toBeNull();
  });

  test("re-validates input that skipped the browser checks", async () => {
    const result = await saveProfileAction({ ...VALID, phone: "x" });

    expect(result.ok).toBe(false);
    expect(await findProfile(testDb.db, "member")).toBeNull();
  });

  test("reports a friendly error when the database fails", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    await testDb.close();

    const result = await saveProfileAction(VALID);

    expect(result).toEqual({
      ok: false,
      message: "We could not save your profile. Please try again.",
    });
    expect(logged).toHaveBeenCalled();
    expect(inspect(logged.mock.calls, { depth: 8 })).not.toContain("98765");
    testDb = await createTestDb();
  });
});
