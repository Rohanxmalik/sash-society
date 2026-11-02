import { beforeEach, describe, expect, test, vi } from "vitest";
import { isAdminEmail, requireAdmin, requireSession } from "./session";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT ${path}`);
  }),
}));

vi.mock("@/backend/auth", () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));
vi.mock("@/backend/env", () => ({
  getEnv: () => ({ ADMIN_EMAILS: ["admin@example.org"] }),
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  cache: <T>(fn: T) => fn,
}));

const sessionFor = (email: string) => ({ user: { id: "user-1", email } });

beforeEach(() => {
  mocks.getSession.mockReset();
});

describe("requireSession", () => {
  test("sends a signed-out visitor to login", async () => {
    mocks.getSession.mockResolvedValue(null);

    await expect(requireSession()).rejects.toThrow("REDIRECT /login");
  });

  test("returns the session of a signed-in member", async () => {
    const session = sessionFor("member@example.org");
    mocks.getSession.mockResolvedValue(session);

    expect(await requireSession()).toBe(session);
  });
});

describe("requireAdmin", () => {
  test("sends a signed-out visitor to login", async () => {
    mocks.getSession.mockResolvedValue(null);

    await expect(requireAdmin()).rejects.toThrow("REDIRECT /login");
  });

  test("sends a member to the home page", async () => {
    mocks.getSession.mockResolvedValue(sessionFor("member@example.org"));

    await expect(requireAdmin()).rejects.toThrow("REDIRECT /");
  });

  test("lets an admin in, whatever the capitals in their email", async () => {
    mocks.getSession.mockResolvedValue(sessionFor("Admin@Example.org"));

    await expect(requireAdmin()).resolves.toBeTruthy();
  });
});

describe("isAdminEmail", () => {
  test("only matches listed emails", () => {
    expect(isAdminEmail("admin@example.org")).toBe(true);
    expect(isAdminEmail("admin@example.org.evil.test")).toBe(false);
  });
});
