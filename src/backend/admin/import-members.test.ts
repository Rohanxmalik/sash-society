import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createAuth, handleAuthRequest } from "@/backend/auth/create-auth";
import { memberships, profiles, user } from "@/backend/db/schema";
import { findProfile } from "@/backend/profiles/repository";
import { formatDateIndia } from "@/shared/dates";
import { addMember, createHarness, type Harness } from "@/backend/test/harness";
import { importMembers } from "./import-members";

const HEADER =
  "name,email,phone,designation,institution,plan,member_number,joined_on,expires_on";
const ROW =
  "Asha Rao,Asha@Example.org,+91 98765 43210,Professor,Delhi University,life-india,LM-0042,2024-03-01,";

let harness: Harness;
const db = () => harness.testDb.db;

beforeEach(async () => {
  harness = await createHarness();
});

afterEach(async () => {
  await harness.testDb.close();
  vi.restoreAllMocks();
});

describe("importMembers", () => {
  test("creates the account, profile and membership", async () => {
    const result = await importMembers(db(), `${HEADER}\n${ROW}\n`);

    expect(result).toEqual({ created: 1, problems: [] });
    const [account] = await db().select().from(user);
    expect(account).toMatchObject({
      email: "asha@example.org",
      name: "Asha Rao",
      emailVerified: true,
    });
    expect((await findProfile(db(), account.id))?.institution).toBe(
      "Delhi University"
    );
    const [membership] = await db().select().from(memberships);
    expect(membership).toMatchObject({
      status: "active",
      planSlug: "life-india",
      memberNumber: "LM-0042",
      expiresAt: null,
    });
  });

  test("reports a row that clashes and carries on with the rest", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const rowFor = (name: string, number: string) =>
      `${name},${name}@example.org,+91 98765 43210,Professor,,life-india,${number},2024-03-01,`;
    const csv = [
      HEADER,
      rowFor("Asha", "LM-1"),
      rowFor("Ravi", "LM-1"),
      rowFor("Meena", "LM-2"),
    ].join("\n");

    const result = await importMembers(db(), csv);

    expect(result.created).toBe(2);
    expect(result.problems).toEqual([
      expect.stringMatching(/^Row 3: .*LM-1/),
    ]);
    expect(await db().select().from(user)).toHaveLength(2);
  });

  test("keeps the original dates", async () => {
    const row =
      "Asha Rao,asha@example.org,+91 98765 43210,Professor,,student,ST-9,2026-01-15,2026-12-31";

    await importMembers(db(), `${HEADER}\n${row}\n`);

    const [membership] = await db().select().from(memberships);
    expect(formatDateIndia(membership.startsAt as Date)).toBe("15 January 2026");
    expect(formatDateIndia(membership.expiresAt as Date)).toBe("31 December 2026");
  });

  test("accepts the plan by its full name", async () => {
    const row =
      "Asha Rao,asha@example.org,+91 98765 43210,Professor,,Student Membership,ST-9,2026-01-15,";

    const result = await importMembers(db(), `${HEADER}\n${row}\n`);

    expect(result.created).toBe(1);
  });

  test("skips someone who already has an account", async () => {
    await addMember(harness, "existing", "asha@example.org");

    const result = await importMembers(db(), `${HEADER}\n${ROW}\n`);

    expect(result.created).toBe(0);
    expect(result.problems[0]).toContain("already has an account");
  });

  test("reports bad rows without stopping the good ones", async () => {
    const bad = "No Email,,+91 98765 43210,Professor,,student,X,2026-01-15,";
    const unknownPlan =
      "Bad Plan,bad@example.org,+91 98765 43210,Professor,,gold,X,2026-01-15,";

    const result = await importMembers(
      db(),
      `${HEADER}\n${bad}\n${ROW}\n${unknownPlan}\n`
    );

    expect(result.created).toBe(1);
    expect(result.problems).toHaveLength(2);
    expect(result.problems[0]).toContain("Row 2");
    expect(result.problems[1]).toContain("Row 4");
  });

  test("refuses a file with the wrong columns", async () => {
    const result = await importMembers(db(), "name,email\nAsha,a@b.org\n");

    expect(result.created).toBe(0);
    expect(result.problems[0]).toContain("plan");
    expect(await db().select().from(profiles)).toHaveLength(0);
  });

  test("an imported member can set a password with Forgot Password", async () => {
    const baseURL = "http://localhost:3000";
    const mail: { text: string }[] = [];
    const auth = createAuth({
      db: db(),
      baseURL,
      secret: "test-secret-that-is-at-least-32-chars",
      rateLimitEnabled: false,
      sendEmail: async (email) => {
        mail.push(email);
      },
    });
    const post = (path: string, body: unknown) =>
      handleAuthRequest(
        auth,
        new Request(`${baseURL}/api/auth${path}`, {
          method: "POST",
          headers: { "content-type": "application/json", origin: baseURL },
          body: JSON.stringify(body),
        })
      );
    await importMembers(db(), `${HEADER}\n${ROW}\n`);

    await post("/request-password-reset", {
      email: "asha@example.org",
      redirectTo: "/reset-password",
    });
    const link = mail[0].text.match(/https?:\/\/\S+/)?.[0] ?? "";
    const opened = await handleAuthRequest(
      auth,
      new Request(link, { headers: { origin: baseURL } })
    );
    const token = new URL(
      opened.headers.get("location") ?? "",
      baseURL
    ).searchParams.get("token");
    await post("/reset-password", { newPassword: "brand-new-password", token });

    const signIn = await post("/sign-in/email", {
      email: "asha@example.org",
      password: "brand-new-password",
    });

    expect(signIn.status).toBe(200);
  });
});
