import { inspect } from "node:util";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { user } from "@/backend/db/schema";
import { findProfile } from "@/backend/profiles/repository";
import { createTestDb, type TestDb } from "@/backend/test/test-db";
import {
  completeSignupAction,
  savePhotoAction,
  saveProfileAction,
} from "./actions";

const mocks = vi.hoisted(() => ({
  requireSession: vi.fn(),
  getDb: vi.fn(),
  setPassword: vi.fn(),
}));

vi.mock("@/backend/auth/session", () => ({
  requireSession: mocks.requireSession,
}));
vi.mock("@/backend/db", () => ({ getDb: mocks.getDb }));
vi.mock("@/backend/auth", () => ({
  getAuth: () => ({ api: { setPassword: mocks.setPassword } }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));

const VALID = {
  fullName: "Asha Rao",
  phone: "+91 98765 43210",
  designation: "Assistant Professor",
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

describe("completeSignupAction", () => {
  const SIGNUP = {
    phone: "+91 98765 43210",
    designation: "Assistant Professor",
    password: "correct-horse-battery",
  };

  beforeEach(() => {
    mocks.requireSession.mockResolvedValue({
      user: { id: "member", name: "Member" },
    });
    mocks.setPassword.mockReset();
    mocks.setPassword.mockResolvedValue({ status: true });
  });

  test("sets the password and creates the profile", async () => {
    const result = await completeSignupAction(SIGNUP);

    expect(result).toEqual({ ok: true });
    expect(mocks.setPassword).toHaveBeenCalledOnce();
    expect(await findProfile(testDb.db, "member")).toMatchObject({
      fullName: "Member",
      phone: SIGNUP.phone,
      designation: SIGNUP.designation,
    });
  });

  test("leaves an existing account alone when signing up again", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    mocks.setPassword.mockRejectedValue(new Error("Password already set"));
    await saveProfileAction(VALID);

    const result = await completeSignupAction({
      ...SIGNUP,
      designation: "Someone else",
    });

    expect(result).toEqual({ ok: true });
    expect((await findProfile(testDb.db, "member"))?.designation).toBe(
      VALID.designation
    );
  });

  test("refuses a password that is too short", async () => {
    const result = await completeSignupAction({ ...SIGNUP, password: "short" });

    expect(result.ok).toBe(false);
    expect(mocks.setPassword).not.toHaveBeenCalled();
    expect(await findProfile(testDb.db, "member")).toBeNull();
  });
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

describe("savePhotoAction", () => {
  const PHOTO = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

  beforeEach(async () => {
    await saveProfileAction(VALID);
  });

  test("stores a valid photo", async () => {
    expect(await savePhotoAction(PHOTO)).toEqual({ ok: true });

    expect((await findProfile(testDb.db, "member"))?.photo).toBe(PHOTO);
  });

  test("rejects anything that is not an image", async () => {
    const result = await savePhotoAction("data:text/html;base64,PGh0bWw+");

    expect(result.ok).toBe(false);
    expect((await findProfile(testDb.db, "member"))?.photo).toBeNull();
  });

  test("removes the photo when given null", async () => {
    await savePhotoAction(PHOTO);

    await savePhotoAction(null);

    expect((await findProfile(testDb.db, "member"))?.photo).toBeNull();
  });
});
