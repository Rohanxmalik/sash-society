import { expect, test, type Page } from "@playwright/test";
import { signUp, uniqueEmail, waitForMail } from "./helpers";

const REGISTER_PATH = "/events/mauritius-2027/register";

async function fillRegistration(page: Page, email: string) {
  await page.getByLabel("Online").check();
  await page.getByLabel("Full Name").fill("Asha Rao");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("WhatsApp Number").fill("+91 98765 43210");
  await page.getByLabel("Affiliation").fill("University of Mumbai");
  await page.getByLabel("Designation").fill("Assistant Professor");
}

test("a guest registers for a conference and pays", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/events/upcoming");
  await page.getByRole("link", { name: /Register/ }).first().click();
  await expect(page).toHaveURL(REGISTER_PATH);

  await fillRegistration(page, email);
  await page.getByLabel("Paper Title").fill("Algorithms and Caste");
  await page.getByRole("button", { name: /^Pay / }).click();

  await expect(
    page.getByRole("heading", { name: "You Are Registered" })
  ).toBeVisible();
  await expect(page).toHaveURL("/", { timeout: 15_000 });

  const mail = await waitForMail(email, /registration/i);
  expect(mail.files).toHaveLength(1);
  expect(mail.text).toContain("SASS/MU27/");
});

test("the same email cannot register twice for an event", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto(REGISTER_PATH);
  await fillRegistration(page, email);
  await page.getByRole("button", { name: /^Pay / }).click();
  await expect(page.getByRole("heading", { name: "You Are Registered" })).toBeVisible();

  await page.goto(REGISTER_PATH);
  await fillRegistration(page, email);
  await page.getByRole("button", { name: /^Pay / }).click();

  await expect(page.getByText(/already registered/i)).toBeVisible();
});

test("the form asks for what is missing before taking payment", async ({ page }) => {
  await page.goto(REGISTER_PATH);

  await page.getByRole("button", { name: /^Pay / }).click();

  await expect(page.getByText("Affiliation is required")).toBeVisible();
  await expect(page.getByRole("heading", { name: "You Are Registered" })).toHaveCount(0);
});

test("a logged-in member finds their details filled in and the event on their profile", async ({
  page,
}) => {
  const email = uniqueEmail();
  await signUp(page, email);

  await page.goto(REGISTER_PATH);
  await expect(page.getByLabel("Email")).toHaveValue(email);
  await expect(page.getByLabel("Full Name")).toHaveValue("Asha Rao");
  await expect(page.getByLabel("WhatsApp Number")).toHaveValue("+91 98765 43210");

  await page.getByLabel("Online").check();
  await page.getByLabel("Affiliation").fill("University of Mumbai");
  await page.getByRole("button", { name: /^Pay / }).click();
  await expect(page.getByRole("heading", { name: "You Are Registered" })).toBeVisible();

  await page.goto("/profile");
  await expect(page.getByText("Mauritius 2027 Conference")).toBeVisible();
});

test("an unknown event has no registration page", async ({ page }) => {
  const response = await page.goto("/events/no-such-event/register");

  expect(response?.status()).toBe(404);
});
