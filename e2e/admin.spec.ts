import { expect, test, type Page } from "@playwright/test";
import { logIn, PASSWORD, signInAsAdmin, signUp, uniqueEmail } from "./helpers";

test.beforeEach(({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
});

async function joinAs(page: Page, email: string, planName: string) {
  await signUp(page, email, "/signup?next=/membership");
  await page
    .locator("div")
    .filter({ has: page.getByRole("heading", { name: planName, exact: true }) })
    .last()
    .getByRole("button", { name: "Join Now" })
    .click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /^Pay / }).click();
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await expect(page).toHaveURL("/");
}

test("a member cannot open the admin panel or its exports", async ({ page }) => {
  await signUp(page, uniqueEmail());

  await page.goto("/admin");
  await expect(page).toHaveURL("/");

  const response = await page.request.get("/api/admin/export/members", {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(307);
});

test("a signed-out visitor is sent to login from the admin panel", async ({
  page,
}) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/login\?next=%2Fadmin$/);
});

test("the admin menu is not hidden behind the site header", async ({ page }) => {
  await signInAsAdmin(page);

  const header = await page.getByRole("banner").boundingBox();
  const menu = await page.getByRole("navigation", { name: "Admin" }).boundingBox();

  expect(menu?.y).toBeGreaterThanOrEqual(
    (header?.y ?? 0) + (header?.height ?? 0)
  );
});

test("the admin finds a member and exports the list", async ({ page, browser }) => {
  const email = uniqueEmail();
  const memberPage = await (await browser.newContext()).newPage();
  await joinAs(memberPage, email, "Student Membership");

  await signInAsAdmin(page);
  await page.getByRole("link", { name: "Members", exact: true }).click();
  await page.getByLabel("Search").fill(email);
  await page.getByRole("button", { name: "Apply" }).click();

  await expect(page.getByRole("link", { name: email })).toBeVisible();

  const response = await page.request.get("/api/admin/export/members");
  expect(response.headers()["content-type"]).toContain("text/csv");
  expect(await response.text()).toContain(email);
});

test("the admin removes a member, who is signed out and cannot return", async ({
  page,
  browser,
}) => {
  const email = uniqueEmail();
  const memberPage = await (await browser.newContext()).newPage();
  await joinAs(memberPage, email, "Student Membership");

  await signInAsAdmin(page);
  await page.goto(`/admin/members?q=${encodeURIComponent(email)}`);
  await page.getByRole("link", { name: email }).click();
  await page.getByLabel("Reason").fill("Broke the code of conduct");
  await page.getByRole("button", { name: "Remove Member" }).click();
  await expect(page.getByText("Member removed.")).toBeVisible();

  await memberPage.goto("/profile");
  await expect(memberPage).toHaveURL(/\/login/);
  await logIn(memberPage, email, PASSWORD);
  await expect(memberPage.getByText("This account has been removed")).toBeVisible();

  await page.getByRole("button", { name: "Reinstate Member" }).click();
  await expect(page.getByText("Member reinstated.")).toBeVisible();
  await memberPage.reload();
  await logIn(memberPage, email, PASSWORD);
  await expect(memberPage).toHaveURL("/profile");
});

test("the admin approves an application and the member becomes active", async ({
  page,
  browser,
}) => {
  const email = uniqueEmail();
  const memberPage = await (await browser.newContext()).newPage();
  await joinAs(memberPage, email, "Ordinary Membership");

  await signInAsAdmin(page);
  await page.goto(`/admin/members?q=${encodeURIComponent(email)}`);
  await page.getByRole("link", { name: email }).click();
  await page.getByRole("button", { name: "Approve" }).click();

  await expect(page.getByText("Approved. Certificate emailed.")).toBeVisible();
  await memberPage.goto("/profile");
  await expect(memberPage.getByRole("link", { name: "Download Certificate" })).toBeVisible();
});

test("the admin rejects an application and it is refunded", async ({
  page,
  browser,
}) => {
  const email = uniqueEmail();
  const memberPage = await (await browser.newContext()).newPage();
  await joinAs(memberPage, email, "Ordinary Membership");

  await signInAsAdmin(page);
  await page.goto(`/admin/members?q=${encodeURIComponent(email)}`);
  await page.getByRole("link", { name: email }).click();
  await page.getByRole("button", { name: "Reject and Refund" }).click();

  await expect(page.getByText("Rejected and refunded.")).toBeVisible();
});

test("the admin sees event registrations and exports them", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/events/mauritius-2027/register");
  await page.getByLabel("Online").check();
  await page.getByLabel("Full Name").fill("Asha Rao");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("WhatsApp Number").fill("+91 98765 43210");
  await page.getByLabel("Affiliation").fill("University of Mumbai");
  await page.getByLabel("Designation").fill("Assistant Professor");
  await page.getByRole("button", { name: /^Pay / }).click();
  await expect(page.getByRole("heading", { name: "You Are Registered" })).toBeVisible();
  await expect(page).toHaveURL("/");

  await signInAsAdmin(page);
  await page
    .getByRole("navigation", { name: "Admin" })
    .getByRole("link", { name: "Events" })
    .click();
  await page.getByRole("link", { name: /Mauritius/ }).click();

  await expect(page.getByText(email)).toBeVisible();
  const response = await page.request.get(
    "/api/admin/export/registrations?event=mauritius-2027"
  );
  expect(await response.text()).toContain(email);
});

test("the admin imports existing members from a CSV", async ({ page }) => {
  const email = uniqueEmail();
  const csv = [
    "name,email,phone,designation,institution,plan,member_number,joined_on,expires_on",
    `Ravi Kumar,${email},+919876543210,Professor,University of Pune,life-india,SASS/LM/2025/9${Date.now() % 1000},2025-03-01,`,
  ].join("\n");

  await signInAsAdmin(page);
  await page.getByRole("link", { name: "Import", exact: true }).click();
  await page.getByLabel("CSV File").setInputFiles({
    name: "members.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv),
  });
  await page.getByRole("button", { name: "Import Members" }).click();

  await expect(page.getByText("1 member imported")).toBeVisible();
  await page.goto(`/admin/members?q=${encodeURIComponent(email)}`);
  await expect(page.getByRole("link", { name: email })).toBeVisible();
});
