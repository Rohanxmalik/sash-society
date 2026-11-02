import { inspect } from "node:util";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { eq } from "drizzle-orm";
import { rateLimit, user } from "@/db/schema";
import type { Email } from "@/lib/email/sender";
import { createTestDb, type TestDb } from "@/test/test-db";
import { createAuth, handleAuthRequest } from "./create-auth";

const BASE_URL = "http://localhost:3000";
const EMAIL = "member@example.org";
const PASSWORD = "correct-horse-battery";
const NEW_PASSWORD = "staple-gun-lighthouse";

let testDb: TestDb;
let mail: Email[];
let auth: ReturnType<typeof createAuth>;

function buildAuth(overrides: Partial<Parameters<typeof createAuth>[0]> = {}) {
  return createAuth({
    db: testDb.db,
    baseURL: BASE_URL,
    secret: "test-secret-that-is-at-least-32-chars",
    rateLimitEnabled: false,
    sendEmail: async (email) => {
      mail.push(email);
    },
    ...overrides,
  });
}

function request(path: string, init: RequestInit & { ip?: string } = {}) {
  return handleAuthRequest(
    auth,
    new Request(`${BASE_URL}/api/auth${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        origin: BASE_URL,
        "x-real-ip": init.ip ?? "203.0.113.1",
        ...init.headers,
      },
    })
  );
}

function post(path: string, body: unknown, ip?: string) {
  return request(path, { method: "POST", body: JSON.stringify(body), ip });
}

const signUp = (email = EMAIL, password = PASSWORD) =>
  post("/sign-up/email", { name: "Asha Rao", email, password });

const signIn = (password = PASSWORD, ip?: string) =>
  post("/sign-in/email", { email: EMAIL, password }, ip);

const linkIn = (email: Email) => {
  const match = email.text.match(/https?:\/\/\S+/);
  if (!match) throw new Error(`No link in: ${email.text}`);
  return match[0];
};

const openLink = (link: string) =>
  handleAuthRequest(auth, new Request(link, { headers: { origin: BASE_URL } }));

const sessionCookie = (res: Response) =>
  res.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .filter((cookie) => cookie.includes("session_token") && !cookie.endsWith("="))
    .join("; ");

const currentUser = async (cookie: string) => {
  const res = await request("/get-session", { headers: { cookie } });
  const body = await res.json();
  return body?.user ?? null;
};

async function registerVerifiedMember() {
  await signUp();
  await openLink(linkIn(mail[0]));
  mail.length = 0;
  return sessionCookie(await signIn());
}

beforeEach(async () => {
  testDb = await createTestDb();
  mail = [];
  auth = buildAuth();
});

afterEach(async () => {
  await testDb.close();
});

describe("sign-up", () => {
  test("emails a verification link and starts no session", async () => {
    const res = await signUp();

    expect(res.status).toBe(200);
    expect(sessionCookie(res)).toBe("");
    expect(mail.map((email) => email.to)).toEqual([EMAIL]);
  });

  test("rejects a password under 8 characters", async () => {
    const res = await signUp(EMAIL, "short12");

    expect(res.status).toBe(400);
    expect(await testDb.db.select().from(user)).toHaveLength(0);
  });

  test("gives the same answer for an email that is already registered", async () => {
    const first = await signUp();
    const second = await signUp(EMAIL, "attacker-chosen-password");

    expect(second.status).toBe(first.status);
    expect(await testDb.db.select().from(user)).toHaveLength(1);
  });

  test("a repeat sign-up does not replace the original password", async () => {
    await registerVerifiedMember();
    await signUp(EMAIL, "attacker-chosen-password");

    expect((await signIn("attacker-chosen-password")).status).toBe(401);
    expect((await signIn()).status).toBe(200);
  });

  test("a repeat sign-up resends the link to an unverified member", async () => {
    await signUp();
    mail.length = 0;

    await signUp();
    const res = await openLink(linkIn(mail[0]));

    const [row] = await testDb.db.select().from(user).where(eq(user.email, EMAIL));
    expect(row.emailVerified).toBe(true);
    expect(res.headers.get("location")).toContain("/verify-email");
  });

  test("a repeat sign-up points a verified member to password reset", async () => {
    await registerVerifiedMember();

    await signUp(EMAIL, "attacker-chosen-password");

    expect(mail.map((email) => email.to)).toEqual([EMAIL]);
    expect(linkIn(mail[0])).toBe(`${BASE_URL}/forgot-password`);
  });

  test("still succeeds when the email provider is down", async () => {
    const failure = vi.fn().mockRejectedValue(new Error("Resend is down"));
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    auth = buildAuth({ sendEmail: failure });

    const res = await signUp();
    await vi.waitFor(() => expect(logged).toHaveBeenCalled());

    expect(res.status).toBe(200);
    logged.mockRestore();
  });
});

describe("email verification", () => {
  test("an unverified member cannot sign in", async () => {
    await signUp();

    const res = await signIn();

    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe("EMAIL_NOT_VERIFIED");
  });

  test("a sign-in attempt resends the link to an unverified member", async () => {
    await signUp();
    mail.length = 0;

    await signIn();

    expect(mail.map((email) => email.to)).toEqual([EMAIL]);
  });

  test("the emailed link verifies the member", async () => {
    await signUp();

    await openLink(linkIn(mail[0]));

    const [row] = await testDb.db.select().from(user).where(eq(user.email, EMAIL));
    expect(row.emailVerified).toBe(true);
  });

  // Whoever signed up chose the password, and they may not own this address.
  test("the emailed link alone starts no session", async () => {
    await signUp();

    const res = await openLink(linkIn(mail[0]));

    expect(sessionCookie(res)).toBe("");
  });

  test.each([
    ["no destination", undefined],
    ["another page", "/membership"],
  ])("the link returns to the verify page when given %s", async (_label, callbackURL) => {
    await post("/sign-up/email", {
      name: "Asha Rao",
      email: EMAIL,
      password: PASSWORD,
      callbackURL,
    });

    const res = await openLink(linkIn(mail[0]));

    const location = new URL(res.headers.get("location") ?? "", BASE_URL);
    expect(location.pathname).toBe("/verify-email");
    expect(location.searchParams.get("verified")).toBe("1");
  });

  test("a tampered link verifies nothing", async () => {
    await signUp();
    const link = linkIn(mail[0]).replace(/token=[^&]+/, "token=tampered");

    await openLink(link);

    const [row] = await testDb.db.select().from(user).where(eq(user.email, EMAIL));
    expect(row.emailVerified).toBe(false);
  });
});

describe("sign-in", () => {
  test("a verified member signs in with their password", async () => {
    await registerVerifiedMember();

    const res = await signIn();

    expect((await currentUser(sessionCookie(res)))?.email).toBe(EMAIL);
  });

  test("a wrong password and an unknown email look identical", async () => {
    await registerVerifiedMember();

    const wrongPassword = await signIn("not-the-password");
    const unknownEmail = await post("/sign-in/email", {
      email: "nobody@example.org",
      password: PASSWORD,
    });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(await wrongPassword.json()).toEqual(await unknownEmail.json());
  });
});

describe("password reset", () => {
  const requestReset = (email: string) =>
    post("/request-password-reset", { email, redirectTo: "/reset-password" });

  const tokenFromLink = async (link: string) => {
    const res = await openLink(link);
    const location = new URL(res.headers.get("location") ?? "", BASE_URL);
    return location.searchParams.get("token") ?? "";
  };

  test("an unknown email gets the same answer and no email", async () => {
    await registerVerifiedMember();

    const known = await requestReset(EMAIL);
    mail.length = 0;
    const unknown = await requestReset("nobody@example.org");

    expect(unknown.status).toBe(known.status);
    expect(mail).toHaveLength(0);
  });

  test("the emailed link replaces the password", async () => {
    await registerVerifiedMember();
    await requestReset(EMAIL);
    const token = await tokenFromLink(linkIn(mail[0]));

    await post("/reset-password", { newPassword: NEW_PASSWORD, token });

    expect((await signIn()).status).toBe(401);
    expect((await signIn(NEW_PASSWORD)).status).toBe(200);
  });

  test("a reset signs out sessions that were already open", async () => {
    const stolenSession = await registerVerifiedMember();
    await requestReset(EMAIL);
    const token = await tokenFromLink(linkIn(mail[0]));

    await post("/reset-password", { newPassword: NEW_PASSWORD, token });

    expect(await currentUser(stolenSession)).toBeNull();
  });

  test("a reset link works only once", async () => {
    await registerVerifiedMember();
    await requestReset(EMAIL);
    const token = await tokenFromLink(linkIn(mail[0]));
    await post("/reset-password", { newPassword: NEW_PASSWORD, token });

    const replay = await post("/reset-password", {
      newPassword: "third-password-attempt",
      token,
    });

    expect(replay.status).toBe(400);
    expect((await signIn(NEW_PASSWORD)).status).toBe(200);
  });
});

describe("rate limiting", () => {
  beforeEach(() => {
    auth = buildAuth({ rateLimitEnabled: true });
  });

  test("checking the session costs no database write", async () => {
    await request("/get-session");

    expect(await testDb.db.select().from(rateLimit)).toHaveLength(0);
  });

  const failedSignIns = async (count: number, ip: string) => {
    const statuses: number[] = [];
    for (let attempt = 0; attempt < count; attempt += 1) {
      statuses.push((await signIn("not-the-password", ip)).status);
    }
    return statuses;
  };

  test("blocks repeated sign-in attempts from one address", async () => {
    const statuses = await failedSignIns(6, "203.0.113.5");

    expect(statuses.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
    expect(statuses[5]).toBe(429);
  });

  test("one address being blocked leaves others unaffected", async () => {
    await failedSignIns(6, "203.0.113.5");

    expect((await signIn("not-the-password", "203.0.113.6")).status).toBe(401);
  });
});

describe("built-in error page", () => {
  test("cannot display text chosen by whoever wrote the link", async () => {
    const res = await openLink(
      `${BASE_URL}/api/auth/error?error=spoof&error_description=Call+this+number`
    );

    expect(res.status).toBe(302);
    expect(new URL(res.headers.get("location") ?? "", BASE_URL).pathname).toBe(
      "/login"
    );
  });
});

describe("logging", () => {
  test("a database failure logs no member data", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    await testDb.close();

    const res = await signUp();

    expect(res.status).toBe(500);
    expect(logged).toHaveBeenCalled();
    expect(inspect(logged.mock.calls, { depth: 8 })).not.toContain(EMAIL);
    logged.mockRestore();
    testDb = await createTestDb();
  });
});
