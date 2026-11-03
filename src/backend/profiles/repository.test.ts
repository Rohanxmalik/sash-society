import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { profiles } from "@/backend/db/schema";
import {
  addLiveMembership,
  addMember,
  createHarness,
  NOW,
  type Harness,
} from "@/backend/test/harness";
import {
  createProfileIfMissing,
  findProfile,
  listDirectory,
  savePhoto,
  saveProfile,
} from "./repository";

const INPUT = {
  fullName: "Asha Rao",
  phone: "+91 98765 43210",
  designation: "Assistant Professor",
  country: "India",
  institution: "University of Delhi",
  education: "PhD Sociology",
  experience: "10 years teaching",
  publications: "Caste and AI (2025)",
  website: "https://asha.example.org",
  showInDirectory: true,
};

let harness: Harness;
const db = () => harness.testDb.db;

beforeEach(async () => {
  harness = await createHarness();
  await addMember(harness, "user-1");
  await addMember(harness, "user-2");
  await db().delete(profiles);
});

afterEach(async () => {
  await harness.testDb.close();
});

describe("profiles repository", () => {
  test("a member without a saved profile has none", async () => {
    expect(await findProfile(db(), "user-1")).toBeNull();
  });

  test("never returns another member's profile", async () => {
    await saveProfile(db(), "user-1", INPUT);

    expect(await findProfile(db(), "user-2")).toBeNull();
  });

  test("saves and returns the profile", async () => {
    await saveProfile(db(), "user-1", INPUT);

    expect(await findProfile(db(), "user-1")).toMatchObject(INPUT);
  });

  test("saving again updates the existing profile", async () => {
    await saveProfile(db(), "user-1", INPUT);
    await saveProfile(db(), "user-1", { ...INPUT, country: "Nepal" });

    expect((await findProfile(db(), "user-1"))?.country).toBe("Nepal");
  });

  test("clearing an optional field on update removes it", async () => {
    await saveProfile(db(), "user-1", INPUT);
    await saveProfile(db(), "user-1", { ...INPUT, publications: undefined });

    expect((await findProfile(db(), "user-1"))?.publications).toBeNull();
  });

  test("clearing the website on update removes it", async () => {
    await saveProfile(db(), "user-1", INPUT);
    await saveProfile(db(), "user-1", { ...INPUT, website: undefined });

    expect((await findProfile(db(), "user-1"))?.website).toBeNull();
  });

  test("saving one member's profile leaves others untouched", async () => {
    await saveProfile(db(), "user-1", INPUT);
    await saveProfile(db(), "user-2", { ...INPUT, fullName: "Bilal Khan" });

    expect((await findProfile(db(), "user-1"))?.fullName).toBe("Asha Rao");
  });
});

describe("createProfileIfMissing", () => {
  const SIGNUP = {
    fullName: "New Name",
    phone: "+91 11111 11111",
    designation: "Lecturer",
  };

  test("creates the profile on first sign-up", async () => {
    await createProfileIfMissing(db(), "user-1", SIGNUP);

    expect((await findProfile(db(), "user-1"))?.designation).toBe("Lecturer");
  });

  test("leaves an existing profile alone", async () => {
    await saveProfile(db(), "user-1", INPUT);

    await createProfileIfMissing(db(), "user-1", SIGNUP);

    expect((await findProfile(db(), "user-1"))?.fullName).toBe("Asha Rao");
  });
});

describe("savePhoto", () => {
  test("changes only that member's photo", async () => {
    await saveProfile(db(), "user-1", INPUT);
    await saveProfile(db(), "user-2", INPUT);

    await savePhoto(db(), "user-1", "data:image/jpeg;base64,AAAA");

    expect((await findProfile(db(), "user-1"))?.photo).toContain("data:image");
    expect((await findProfile(db(), "user-2"))?.photo).toBeNull();
  });
});

describe("listDirectory", () => {
  beforeEach(async () => {
    await saveProfile(db(), "user-1", INPUT);
    await saveProfile(db(), "user-2", { ...INPUT, fullName: "Bilal Khan" });
  });

  const names = async () =>
    (await listDirectory(db(), NOW)).map((row) => row.fullName);

  test("lists active members", async () => {
    await addLiveMembership(harness, "user-1");

    expect(await names()).toEqual(["Asha Rao"]);
  });

  test("hides anyone who has not joined", async () => {
    expect(await names()).toEqual([]);
  });

  test("hides members who opted out", async () => {
    await addLiveMembership(harness, "user-1");
    await db()
      .update(profiles)
      .set({ showInDirectory: false })
      .where(eq(profiles.userId, "user-1"));

    expect(await names()).toEqual([]);
  });

  test("hides lapsed members", async () => {
    await addLiveMembership(harness, "user-1", {
      expiresAt: new Date("2026-01-01T00:00:00Z"),
    });

    expect(await names()).toEqual([]);
  });

  test("hides removed members", async () => {
    await addLiveMembership(harness, "user-1", { status: "removed" });

    expect(await names()).toEqual([]);
  });

  test("shows nothing private", async () => {
    await addLiveMembership(harness, "user-1");

    const [row] = await listDirectory(db(), NOW);

    expect(Object.keys(row).sort()).toEqual([
      "designation",
      "fullName",
      "institution",
      "planSlug",
    ]);
  });

  test("shows the membership plan and institution", async () => {
    await addLiveMembership(harness, "user-1");

    const [row] = await listDirectory(db(), NOW);

    expect(row.institution).toBe("University of Delhi");
    expect(row.planSlug).toBeTruthy();
  });
});
