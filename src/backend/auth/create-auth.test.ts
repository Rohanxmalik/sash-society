import { inspect } from "node:util";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { eq } from "drizzle-orm";
import { rateLimit, user } from "@/backend/db/schema";
import type { Email } from "@/backend/email/sender";
import { createTestDb, type TestDb } from "@/backend/test/test-db";
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

const sendCode = (email = EMAIL, ip?: string) =>
  post("/email-otp/send-verification-otp", { email, type: "sign-in" }, ip);

const submitCode = (otp: string, email = EMAIL) =>
  post("/sign-in/email-otp", { email, otp, name: "Asha Rao" });

const signIn = (password = PASSWORD, ip?: string) =>
  post("/sign-in/email", { email: EMAIL, password }, ip);

const codeIn = (email: Email) => {
  const match = email.text.match(/\b\d{6}\b/);
  if (!match) throw new Error(`No code in: ${email.text}`);
  return match[0];
};

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

const setPassword = (cookie: string, newPassword = PASSWORD) =>
  auth.api.setPassword({
    body: { newPassword },
    headers: new Headers({ cookie }),
  });

async function registerMember() {
  await sendCode();
  const cookie = sessionCookie(await submitCode(codeIn(mail[0])));
  await setPassword(cookie);
  mail.length = 0;
  return cookie;
}

const accounts = () => testDb.db.select().from(user);

beforeEach(async () => {
  testDb = await createTestDb();
  mail = [];
  auth = buildAuth();
});

afterEach(async () => {
  await testDb.close();
});

describe("sign-up", () => {
  test("is closed to anyone who has not proved they own the email", async () => {
    const res = await post("/sign-up/email", {
      name: "Attacker",
      email: EMAIL,
      password: PASSWORD,
    });

    expect(res.status).toBe(400);
    expect(await accounts()).toHaveLength(0);
  });

  test("asking for a code emails it and creates no account", async () => {
    const res = await sendCode();

    expect(res.status).toBe(200);
    expect(mail.map((email) => email.to)).toEqual([EMAIL]);
    expect(await accounts()).toHaveLength(0);
  });

  test("the right code creates a verified account and signs them in", async () => {
    await sendCode();

    const res = await submitCode(codeIn(mail[0]));

    const [row] = await accounts();
    expect(row).toMatchObject({ email: EMAIL, name: "Asha Rao", emailVerified: true });
    expect((await currentUser(sessionCookie(res)))?.email).toBe(EMAIL);
  });

  test("a wrong code creates nothing", async () => {
    await sendCode();

    const res = await submitCode("000000");

    expect(res.status).toBe(400);
    expect(await accounts()).toHaveLength(0);
  });

  test("a code works only once", async () => {
    await sendCode();
    const code = codeIn(mail[0]);
    await submitCode(code);

    const replay = await submitCode(code);

    expect(replay.status).toBe(400);
  });

  test("asking again sends the same code, so a stranger cannot cancel yours", async () => {
    await sendCode();
    await sendCode();

    expect(codeIn(mail[1])).toBe(codeIn(mail[0]));
  });

  test("three wrong guesses cancel the code", async () => {
    await sendCode();
    const code = codeIn(mail[0]);
    await submitCode("000000");
    await submitCode("000000");
    await submitCode("000000");

    const res = await submitCode(code);

    expect(res.status).toBe(403);
    expect(await accounts()).toHaveLength(0);
  });

  test("the owner signing up again keeps their existing password", async () => {
    await registerMember();
    await sendCode();
    const cookie = sessionCookie(await submitCode(codeIn(mail[0])));

    await expect(setPassword(cookie, NEW_PASSWORD)).rejects.toThrow();

    expect((await signIn()).status).toBe(200);
  });

  test("still answers when the email provider is down", async () => {
    const failure = vi.fn().mockRejectedValue(new Error("Resend is down"));
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    auth = buildAuth({ sendEmail: failure });

    const res = await sendCode();
    await vi.waitFor(() => expect(logged).toHaveBeenCalled());

    expect(res.status).toBe(200);
    logged.mockRestore();
  });
});

describe("sign-in", () => {
  test("a member signs in with their password", async () => {
    await registerMember();

    const res = await signIn();

    expect((await currentUser(sessionCookie(res)))?.email).toBe(EMAIL);
  });

  test("a wrong password and an unknown email look identical", async () => {
    await registerMember();

    const wrongPassword = await signIn("not-the-password");
    const unknownEmail = await post("/sign-in/email", {
      email: "nobody@example.org",
      password: PASSWORD,
    });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(await wrongPassword.json()).toEqual(await unknownEmail.json());
  });

  test("a password shorter than 8 characters cannot be set", async () => {
    await sendCode();
    const cookie = sessionCookie(await submitCode(codeIn(mail[0])));

    await expect(setPassword(cookie, "short12")).rejects.toThrow();
  });
});

describe("a removed member", () => {
  const remove = () =>
    testDb.db.update(user).set({ banned: true }).where(eq(user.email, EMAIL));

  test("cannot sign in with their password", async () => {
    await registerMember();
    await remove();

    const res = await signIn();

    expect(res.status).toBe(403);
    expect(sessionCookie(res)).toBe("");
  });

  test("cannot sign in with an emailed code", async () => {
    await registerMember();
    await remove();
    await sendCode();

    const res = await submitCode(codeIn(mail[0]));

    expect(sessionCookie(res)).toBe("");
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
    await registerMember();

    const known = await requestReset(EMAIL);
    mail.length = 0;
    const unknown = await requestReset("nobody@example.org");

    expect(unknown.status).toBe(known.status);
    expect(mail).toHaveLength(0);
  });

  test("the emailed link replaces the password", async () => {
    await registerMember();
    await requestReset(EMAIL);
    const token = await tokenFromLink(linkIn(mail[0]));

    await post("/reset-password", { newPassword: NEW_PASSWORD, token });

    expect((await signIn()).status).toBe(401);
    expect((await signIn(NEW_PASSWORD)).status).toBe(200);
  });

  test("a reset signs out sessions that were already open", async () => {
    const stolenSession = await registerMember();
    await requestReset(EMAIL);
    const token = await tokenFromLink(linkIn(mail[0]));

    await post("/reset-password", { newPassword: NEW_PASSWORD, token });

    expect(await currentUser(stolenSession)).toBeNull();
  });

  test("a reset link works only once", async () => {
    await registerMember();
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

  const failedSignIns = async (count: number, ip: string) => {
    const statuses: number[] = [];
    for (let attempt = 0; attempt < count; attempt += 1) {
      statuses.push((await signIn("not-the-password", ip)).status);
    }
    return statuses;
  };

  test("checking the session costs no database write", async () => {
    await request("/get-session");

    expect(await testDb.db.select().from(rateLimit)).toHaveLength(0);
  });

  test("blocks repeated sign-in attempts from one address", async () => {
    const statuses = await failedSignIns(6, "203.0.113.5");

    expect(statuses.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
    expect(statuses[5]).toBe(429);
  });

  test("one address being blocked leaves others unaffected", async () => {
    await failedSignIns(6, "203.0.113.5");

    expect((await signIn("not-the-password", "203.0.113.6")).status).toBe(401);
  });

  test("blocks one address from requesting codes for many emails", async () => {
    const statuses: number[] = [];
    for (let index = 0; index < 6; index += 1) {
      const res = await sendCode(`person${index}@example.org`, "203.0.113.7");
      statuses.push(res.status);
    }

    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);
  });

  test("emails one address at most once a minute", async () => {
    await sendCode(EMAIL, "203.0.113.8");
    await sendCode(EMAIL, "203.0.113.9");

    expect(mail).toHaveLength(1);
  });
});

describe("unused account endpoints", () => {
  test("are switched off", async () => {
    const cookie = await registerMember();

    const res = await request("/update-user", {
      method: "POST",
      body: JSON.stringify({ name: "x".repeat(500) }),
      headers: { cookie },
    });

    expect(res.status).toBe(404);
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

    const res = await signIn();

    expect(res.status).toBe(500);
    expect(logged).toHaveBeenCalled();
    expect(inspect(logged.mock.calls, { depth: 8 })).not.toContain(EMAIL);
    logged.mockRestore();
    testDb = await createTestDb();
  });
});
