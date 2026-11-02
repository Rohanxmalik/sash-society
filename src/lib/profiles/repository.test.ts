import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { user } from "@/db/schema";
import { createTestDb, type TestDb } from "@/test/test-db";
import { findProfile, saveProfile } from "./repository";

const INPUT = {
  fullName: "Asha Rao",
  phone: "+91 98765 43210",
  country: "India",
  institution: "University of Delhi",
  qualification: "PhD Sociology",
};

let testDb: TestDb;

const addUser = (id: string) =>
  testDb.db.insert(user).values({
    id,
    name: "Member",
    email: `${id}@example.org`,
  });

beforeEach(async () => {
  testDb = await createTestDb();
  await addUser("user-1");
  await addUser("user-2");
});

afterEach(async () => {
  await testDb.close();
});

describe("profiles repository", () => {
  test("a member without a saved profile has none", async () => {
    expect(await findProfile(testDb.db, "user-1")).toBeNull();
  });

  test("never returns another member's profile", async () => {
    await saveProfile(testDb.db, "user-1", INPUT);

    expect(await findProfile(testDb.db, "user-2")).toBeNull();
  });

  test("saves and returns the profile", async () => {
    await saveProfile(testDb.db, "user-1", INPUT);

    expect(await findProfile(testDb.db, "user-1")).toMatchObject(INPUT);
  });

  test("saving again updates the existing profile", async () => {
    await saveProfile(testDb.db, "user-1", INPUT);
    await saveProfile(testDb.db, "user-1", { ...INPUT, country: "Nepal" });

    expect((await findProfile(testDb.db, "user-1"))?.country).toBe("Nepal");
  });

  test("clearing an optional field on update removes it", async () => {
    await saveProfile(testDb.db, "user-1", INPUT);
    await saveProfile(testDb.db, "user-1", { ...INPUT, institution: undefined });

    expect((await findProfile(testDb.db, "user-1"))?.institution).toBeNull();
  });

  test("saving one member's profile leaves others untouched", async () => {
    await saveProfile(testDb.db, "user-1", INPUT);
    await saveProfile(testDb.db, "user-2", { ...INPUT, fullName: "Bilal Khan" });

    expect((await findProfile(testDb.db, "user-1"))?.fullName).toBe("Asha Rao");
  });
});
