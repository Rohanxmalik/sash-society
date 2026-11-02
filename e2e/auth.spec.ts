import { existsSync, readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const MAIL_FILE = ".dev-mail.jsonl";
const PASSWORD = "correct-horse-battery";
const NEW_PASSWORD = "staple-gun-lighthouse";

const uniqueEmail = () =>
  `member-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.org`;

function linksSentTo(email: string): string[] {
  if (!existsSync(MAIL_FILE)) return [];

  return readFileSync(MAIL_FILE, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((message) => message.to === email)
    .map((message) => message.text.match(/https?:\/\/\S+/)[0]);
}

async function nthLinkSentTo(email: string, count: number) {
  await expect
    .poll(() => linksSentTo(email).length)
    .toBeGreaterThanOrEqual(count);
  return linksSentTo(email)[count - 1];
}

async function signUp(page: Page, email: string) {
  await page.goto("/signup");
  await page.getByLabel("Full Name").fill("Asha Rao");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password *", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirm Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(
    page.getByRole("heading", { name: "Check your inbox" })
  ).toBeVisible();
}

async function logIn(page: Page, email: string, password = PASSWORD) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log In" }).click();
}

async function registerVerifiedMember(page: Page, email: string) {
  await signUp(page, email);
  await page.goto(await nthLinkSentTo(email, 1));
  await expect(
    page.getByRole("heading", { name: "Your email is verified" })
  ).toBeVisible();
}

async function goToLoginFromVerifiedPage(page: Page) {
  await page.getByRole("main").getByRole("link", { name: "Log In" }).click();
  await expect(page).toHaveURL("/login");
}

test("a signed-out visitor is sent to login from the account page", async ({
  page,
}) => {
  await page.goto("/account");

  await expect(page).toHaveURL(/\/login\?next=%2Faccount$/);
});

test("a forged session cookie does not open the account page", async ({
  page,
  context,
  baseURL,
}) => {
  await context.addCookies([
    { name: "better-auth.session_token", value: "forged.value", url: baseURL },
  ]);

  await page.goto("/account");

  await expect(page).toHaveURL(/\/login/);
});

test("a new member verifies, completes a profile and signs back in", async ({
  page,
}) => {
  const email = uniqueEmail();

  await signUp(page, email);

  await page.goto("/login");
  await logIn(page, email);
  await expect(page.getByText("Please verify your email first")).toBeVisible();

  await page.goto(await nthLinkSentTo(email, 1));
  await expect(
    page.getByRole("heading", { name: "Your email is verified" })
  ).toBeVisible();
  await expect(page.getByRole("banner")).toContainText("Log In");
  await goToLoginFromVerifiedPage(page);
  await logIn(page, email);
  await expect(page).toHaveURL("/account");

  await expect(page.getByLabel("Full Name")).toHaveValue("Asha Rao");
  await expect(page.getByRole("banner")).toContainText("My Account");
  await page.getByLabel("Phone").fill("+91 98765 43210");
  await page.getByLabel("Country").fill("India");
  await page.getByLabel("Institution").fill("University of Delhi");
  await page.getByRole("button", { name: "Save Profile" }).click();
  await expect(page.getByRole("status")).toContainText("Profile saved");

  await page.reload();
  await expect(page.getByLabel("Institution")).toHaveValue(
    "University of Delhi"
  );

  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login\?next=%2Faccount$/);

  await logIn(page, email);
  await expect(page).toHaveURL("/account");
  await expect(page.getByLabel("Phone")).toHaveValue("+91 98765 43210");
});

test("invalid profile input keeps what the member typed", async ({ page }) => {
  const email = uniqueEmail();
  await registerVerifiedMember(page, email);
  await goToLoginFromVerifiedPage(page);
  await logIn(page, email);
  await expect(page).toHaveURL("/account");

  await page.getByLabel("Phone").fill("not a phone");
  await page.getByLabel("Country").fill("India");
  await page.getByRole("button", { name: "Save Profile" }).click();

  await expect(page.getByText("Enter a valid phone number")).toBeVisible();
  await expect(page.getByLabel("Country")).toHaveValue("India");
});

test("a member resets a forgotten password", async ({ page }) => {
  const email = uniqueEmail();
  await registerVerifiedMember(page, email);

  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL("/forgot-password");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send Reset Link" }).click();
  await expect(page.getByRole("status")).toContainText(
    "If an account exists for that email"
  );

  await page.goto(await nthLinkSentTo(email, 2));
  await page.getByLabel("New Password *", { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel("Confirm Password").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Change Password" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Your password has been changed"
  );

  await page.goto("/login");
  await logIn(page, email);
  await expect(page.getByText("Incorrect email or password")).toBeVisible();

  await logIn(page, email, NEW_PASSWORD);
  await expect(page).toHaveURL("/account");
});

test("a broken verification link offers a new one", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, email);
  const link = await nthLinkSentTo(email, 1);

  await page.goto(link.replace(/token=[^&]+/, "token=tampered"));

  await expect(
    page.getByRole("heading", { name: "This link has expired" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send New Link" })
  ).toBeVisible();
});

test("login ignores a redirect to another site", async ({ page }) => {
  const email = uniqueEmail();
  await registerVerifiedMember(page, email);

  await page.goto("/login?next=https://evil.example/phish");
  await logIn(page, email);

  await expect(page).toHaveURL("/account");
});

for (const path of [
  "/login?next=/a&next=/b",
  "/reset-password?token=a&token=b",
  "/verify-email?error=a&error=b",
]) {
  test(`a repeated query parameter does not break ${path}`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response?.status()).toBe(200);
  });
}

test("pages send security headers", async ({ page }) => {
  const response = await page.goto("/login");
  const headers = response?.headers() ?? {};

  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("the reset page never leaks its token through the referrer", async ({
  page,
}) => {
  const response = await page.goto("/reset-password?token=abc");

  expect(response?.headers()["referrer-policy"]).toBe("no-referrer");
});
