import { expect, test } from "@playwright/test";
import {
  enterCode,
  fillSignupDetails,
  latestCode,
  latestLink,
  logIn,
  PASSWORD,
  signOut,
  signUp,
  uniqueEmail,
} from "./helpers";

const NEW_PASSWORD = "staple-gun-lighthouse";

test("a signed-out visitor is sent to login from the profile page", async ({
  page,
}) => {
  await page.goto("/profile");

  await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/);
});

test("a forged session cookie does not open the profile page", async ({
  page,
  context,
  baseURL,
}) => {
  await context.addCookies([
    { name: "better-auth.session_token", value: "forged.value", url: baseURL },
  ]);

  await page.goto("/profile");

  await expect(page).toHaveURL(/\/login/);
});

test("signing up with an emailed code fills in the profile", async ({ page }) => {
  const email = uniqueEmail();

  await signUp(page, email);

  await expect(page).toHaveURL("/membership");
  await page.goto("/profile");
  await expect(page.getByLabel("Full Name")).toHaveValue("Asha Rao");
  await expect(page.getByLabel("Phone Number")).toHaveValue("+91 98765 43210");
  await expect(page.getByLabel("Designation")).toHaveValue("Assistant Professor");
  await expect(page.getByText(email)).toBeVisible();
});

test("a wrong code does not create an account", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/signup");
  await fillSignupDetails(page, email);
  const realCode = await latestCode(email);

  await enterCode(page, realCode === "000000" ? "111111" : "000000");

  await expect(page.getByText("That code is not right")).toBeVisible();
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login/);
});

test("the password chosen at sign-up works for logging in", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, email);
  await signOut(page);

  await page.goto("/login");
  await logIn(page, email);

  await expect(page).toHaveURL("/profile");
});

test("a wrong password is refused", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, email);
  await signOut(page);

  await page.goto("/login");
  await logIn(page, email, "wrong-password");

  await expect(page.getByText("Incorrect email or password")).toBeVisible();
});

test("login returns to the page the visitor came from", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, email);
  await signOut(page);

  await page.goto("/login?next=/membership");
  await logIn(page, email);

  await expect(page).toHaveURL("/membership");
});

test("login ignores a return address on another site", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, email);
  await signOut(page);

  await page.goto("/login?next=https://evil.example/phish");
  await logIn(page, email);

  await expect(page).toHaveURL("/profile");
});

test("a forgotten password can be reset by email", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, email);
  await signOut(page);

  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send Reset Link" }).click();
  await expect(page.getByText("If an account exists")).toBeVisible();

  await page.goto(await latestLink(email, /reset/i));
  await page.getByLabel("New Password").fill(NEW_PASSWORD);
  await page.getByLabel("Confirm Password").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Change Password" }).click();
  await page.getByRole("main").getByRole("link", { name: "Log In" }).click();

  await logIn(page, email, PASSWORD);
  await expect(page.getByText("Incorrect email or password")).toBeVisible();
  await logIn(page, email, NEW_PASSWORD);
  await expect(page).toHaveURL("/profile");
});

test("the forgot password page does not reveal who has an account", async ({
  page,
}) => {
  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(uniqueEmail());
  await page.getByRole("button", { name: "Send Reset Link" }).click();

  await expect(page.getByText("If an account exists")).toBeVisible();
});
