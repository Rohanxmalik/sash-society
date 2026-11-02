import { expect, test } from "@playwright/test";
import { mailSentTo, uniqueEmail } from "./helpers";

test("the contact form reaches the society", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/contact");

  await page.getByLabel("First Name").fill("Asha");
  await page.getByLabel("Last Name").fill("Rao");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Subject").fill("Membership question");
  await page.getByLabel("Message").fill("I would like to know more about joining.");
  await page.getByRole("button", { name: /Send Message/ }).click();

  await expect(page.getByText("Thank you for your message")).toBeVisible();
  await expect
    .poll(() => mailSentTo("southasiansociety2@gmail.com").some((m) => m.text.includes(email)))
    .toBe(true);
});

test("the policies a payment provider checks for are all linked in the footer", async ({
  page,
}) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");

  for (const name of [
    "Privacy Policy",
    "Terms & Conditions",
    "Refund Policy",
    "Delivery Policy",
  ]) {
    await footer.getByRole("link", { name }).click();
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await page.goBack();
  }
});

test("the gallery page loads without broken images", async ({ page }) => {
  await page.goto("/conferences/gallery");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('img[src*="sass-socio.org"]')).toHaveCount(0);
});

test("the health check reports the database is reachable", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
});

test("the daily job refuses callers without the secret", async ({ request }) => {
  const response = await request.post("/api/cron/daily");

  expect(response.status()).toBe(401);
});

test("the webhook refuses an unsigned request", async ({ request }) => {
  const response = await request.post("/api/webhooks/razorpay", {
    data: { event: "payment.captured" },
  });

  expect([400, 503]).toContain(response.status());
});
