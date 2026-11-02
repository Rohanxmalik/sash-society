import { existsSync, readFileSync } from "node:fs";
import { expect, type Page } from "@playwright/test";

const MAIL_FILE = ".dev-mail.jsonl";

export const PASSWORD = "correct-horse-battery";
// Must be listed in ADMIN_EMAILS in .env.local.
export const ADMIN_EMAIL = "admin@example.org";

type SentMail = {
  to: string;
  subject: string;
  text: string;
  files: string[];
};

export const uniqueEmail = () =>
  `member-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.org`;

export function mailSentTo(email: string): SentMail[] {
  if (!existsSync(MAIL_FILE)) return [];

  return readFileSync(MAIL_FILE, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as SentMail)
    .filter((message) => message.to === email);
}

export async function waitForMail(email: string, subject: RegExp) {
  await expect
    .poll(() => mailSentTo(email).filter((mail) => subject.test(mail.subject)).length)
    .toBeGreaterThan(0);
  return mailSentTo(email).findLast((mail) => subject.test(mail.subject)) as SentMail;
}

export async function latestCode(email: string) {
  const mail = await waitForMail(email, /is your SASS code/);
  return mail.subject.slice(0, 6);
}

export async function latestLink(email: string, subject: RegExp) {
  const mail = await waitForMail(email, subject);
  return (mail.text.match(/https?:\/\/\S+/) as RegExpMatchArray)[0];
}

export async function fillSignupDetails(page: Page, email: string) {
  await page.getByLabel("Full Name").fill("Asha Rao");
  await page.getByLabel("Phone Number").fill("+91 98765 43210");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Designation").fill("Assistant Professor");
  await page.getByLabel("Password *", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirm Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Continue" }).click();
}

export async function enterCode(page: Page, code: string) {
  await page.getByLabel("6-digit Code").fill(code);
  await page.getByRole("button", { name: "Verify and Finish" }).click();
}

// Leaves the browser signed in, on the page sign-up returns to.
export async function signUp(page: Page, email: string, path = "/signup") {
  await page.goto(path);
  await fillSignupDetails(page, email);
  await enterCode(page, await latestCode(email));
  await expect(page).not.toHaveURL(/\/signup/);
}

export async function logIn(page: Page, email: string, password = PASSWORD) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log In" }).click();
}

// The form fills itself in as React starts up, which would undo anything typed
// before then.
export async function openProfile(page: Page) {
  await page.goto("/profile");
  await page.waitForLoadState("networkidle");
}

export async function signOut(page: Page) {
  await page.goto("/profile");
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(page).toHaveURL("/");
}

// The admin account is created the first time this runs against a database.
export async function signInAsAdmin(page: Page) {
  const overview = page.getByRole("heading", { name: "Overview" });
  const refused = page.getByText("Incorrect email or password");

  await page.goto("/login?next=/admin");
  await logIn(page, ADMIN_EMAIL);
  await expect(overview.or(refused)).toBeVisible();

  if (await refused.isVisible()) {
    await signUp(page, ADMIN_EMAIL, "/signup?next=/admin");
    await expect(overview).toBeVisible();
  }
}
