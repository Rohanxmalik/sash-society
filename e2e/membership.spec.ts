import { expect, test, type Page } from "@playwright/test";
import {
  enterCode,
  fillSignupDetails,
  latestCode,
  openProfile,
  signUp,
  uniqueEmail,
  waitForMail,
} from "./helpers";

const planCard = (page: Page, name: string) =>
  page.locator("div").filter({ has: page.getByRole("heading", { name, exact: true }) }).last();

async function payFor(page: Page, planName: string) {
  await planCard(page, planName).getByRole("button", { name: "Join Now" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /^Pay / }).click();
}

test("a new visitor joins, pays, sees the welcome and finds the plan on their profile", async ({
  page,
}) => {
  const email = uniqueEmail();

  await page.goto("/");
  await page.goto("/membership");
  await planCard(page, "Life Membership (India)").getByRole("link", { name: "Join Now" }).click();
  await expect(page).toHaveURL(/\/signup\?next=/);

  await fillSignupDetails(page, email);
  await enterCode(page, await latestCode(email));

  await expect(page).toHaveURL("/membership?plan=life-india");
  await expect(page.getByText("Your Selection")).toBeVisible();

  await payFor(page, "Life Membership (India)");

  await expect(
    page.getByRole("heading", { name: "Welcome to SASS Society" })
  ).toBeVisible();
  await expect(page).toHaveURL("/", { timeout: 15_000 });

  await page.goto("/profile");
  await expect(page.getByText("Life Membership (India)")).toBeVisible();
  await expect(page.getByText(/SASS\/LM\/\d{4}\/\d{4}/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Download Certificate" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download Receipt" })).toBeVisible();

  const mail = await waitForMail(email, /Welcome/);
  expect(mail.files).toHaveLength(2);
});

test("the certificate and receipt download as PDFs for the member", async ({
  page,
}) => {
  await signUp(page, uniqueEmail(), "/signup?next=/membership");
  await payFor(page, "Student Membership");
  await expect(page.getByRole("heading", { name: "Welcome to SASS Society" })).toBeVisible();

  await page.goto("/profile");
  const href = await page
    .getByRole("link", { name: "Download Certificate" })
    .getAttribute("href");
  const response = await page.request.get(href as string);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("application/pdf");
});

test("someone else cannot download a member's certificate", async ({
  page,
  browser,
}) => {
  await signUp(page, uniqueEmail(), "/signup?next=/membership");
  await payFor(page, "Student Membership");
  await expect(page.getByRole("heading", { name: "Welcome to SASS Society" })).toBeVisible();
  await page.goto("/profile");
  const href = await page
    .getByRole("link", { name: "Download Certificate" })
    .getAttribute("href");

  const stranger = await (await browser.newContext()).newPage();
  await signUp(stranger, uniqueEmail());
  const response = await stranger.request.get(href as string);

  expect(response.status()).toBe(404);
});

test("an approval plan waits for the committee after payment", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, email, "/signup?next=/membership");

  await payFor(page, "Ordinary Membership");

  await expect(
    page.getByRole("heading", { name: "Application Received" })
  ).toBeVisible();
  await page.goto("/profile");
  await expect(page.getByText("Waiting for approval")).toBeVisible();
  await expect(page.getByRole("link", { name: "Download Certificate" })).toHaveCount(0);
  await waitForMail(email, /received/i);
});

test("a member cannot buy a second plan", async ({ page }) => {
  await signUp(page, uniqueEmail(), "/signup?next=/membership");
  await payFor(page, "Student Membership");
  await expect(page.getByRole("heading", { name: "Welcome to SASS Society" })).toBeVisible();

  await page.goto("/membership");

  await expect(page.getByRole("button", { name: "Your Plan" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Join Now" })).toHaveCount(0);
});

test("a member can update their profile", async ({ page }) => {
  await signUp(page, uniqueEmail());
  await openProfile(page);

  await page.getByLabel("Education").fill("St Xavier's College, Mumbai");
  await page.getByLabel("Experience").fill("Ten years of teaching");
  await page.getByLabel("Publications").fill("Caste and the City (2021)");
  await page.getByRole("button", { name: "Save Profile" }).click();
  await expect(page.getByText("Your profile has been saved")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Education")).toHaveValue("St Xavier's College, Mumbai");
  await expect(page.getByLabel("Publications")).toHaveValue("Caste and the City (2021)");
});

test("a member can upload a profile photo", async ({ page }) => {
  await signUp(page, uniqueEmail());
  await openProfile(page);

  await page.getByLabel("Upload Photo").setInputFiles("public/images/logo.png");

  await expect(page.getByRole("img", { name: "Your profile photo" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("img", { name: "Your profile photo" })).toBeVisible();
});

test("active members appear in the directory unless they opt out", async ({
  page,
}) => {
  const suffix = Date.now().toString(36).replace(/\d/g, "x");
  const name = `Meera Directory ${suffix}`;
  await signUp(page, uniqueEmail(), "/signup?next=/membership");
  await payFor(page, "Student Membership");
  await expect(page.getByRole("heading", { name: "Welcome to SASS Society" })).toBeVisible();

  await openProfile(page);
  await page.getByLabel("Full Name").fill(name);
  await page.getByRole("button", { name: "Save Profile" }).click();
  await expect(page.getByText("Your profile has been saved")).toBeVisible();

  await page.goto("/membership/members");
  await expect(page.getByText(name)).toBeVisible();

  await openProfile(page);
  await page.getByLabel("Show my name in the public members list").uncheck();
  await page.getByRole("button", { name: "Save Profile" }).click();
  await expect(page.getByText("Your profile has been saved")).toBeVisible();

  await page.goto("/membership/members");
  await expect(page.getByText(name)).toHaveCount(0);
});
