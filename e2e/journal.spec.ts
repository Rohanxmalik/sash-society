import { expect, test, type Page } from "@playwright/test";
import {
  logIn,
  mailSentTo,
  PASSWORD,
  signInAsAdmin,
  signUp,
  uniqueEmail,
  waitForMail,
} from "./helpers";

const PDF = {
  name: "paper.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.7 a small test document"),
};

const uniqueTitle = () => `Algorithms and Caste ${Date.now().toString(36)}`;

test.beforeEach(({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
});

async function joinAsMember(page: Page, email: string) {
  await signUp(page, email, "/signup?next=/membership");
  await page
    .locator("div")
    .filter({
      has: page.getByRole("heading", { name: "Student Membership", exact: true }),
    })
    .last()
    .getByRole("button", { name: "Join Now" })
    .click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /^Pay / }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome to SASS Society" })
  ).toBeVisible();
}

async function openSubmitForm(page: Page) {
  await page.goto("/journal/submit");
  await page.waitForLoadState("networkidle");
}

async function fillSubmission(page: Page, title: string) {
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Authors").fill("Asha Rao");
  await page.getByLabel("Abstract").fill("How automated hiring treats caste.");
  await page.getByLabel("Type of Work").selectOption("Research Article");
  await page.getByLabel(/my own original work/).check();
}

async function submitWork(page: Page, title: string) {
  await openSubmitForm(page);
  await fillSubmission(page, title);
  await page.getByLabel("Your File").setInputFiles(PDF);
  await page.getByRole("button", { name: "Submit Work" }).click();
  await expect(page.getByText("sent for review")).toBeVisible();
}

async function approve(page: Page, title: string) {
  await signInAsAdmin(page);
  await page.goto("/admin/journal");
  const row = page.getByRole("row").filter({ hasText: title });
  await row.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("Published. The author")).toBeVisible();
}

test("a member submits work, the admin approves it and it appears in the journal", async ({
  page,
  browser,
}) => {
  const email = uniqueEmail();
  const title = uniqueTitle();
  await joinAsMember(page, email);
  await submitWork(page, title);

  await expect(page.getByText(title)).toBeVisible();
  await expect(page.getByText("Under review")).toBeVisible();
  await waitForMail(email, /received your journal submission/);

  await page.goto("/journal/archive");
  await expect(page.getByText(title)).toHaveCount(0);

  const adminPage = await (await browser.newContext()).newPage();
  adminPage.on("dialog", (dialog) => dialog.accept());
  await approve(adminPage, title);

  await page.goto("/journal");
  await expect(page.getByText(title)).toBeVisible();
  await page.goto("/journal/archive");
  await expect(page.getByText(title)).toBeVisible();
  await waitForMail(email, /has been published/);
});

test("a signed-out reader is asked to log in, then reaches the PDF", async ({
  page,
  browser,
}) => {
  const email = uniqueEmail();
  const title = uniqueTitle();
  const memberPage = await (await browser.newContext()).newPage();
  await joinAsMember(memberPage, email);
  await submitWork(memberPage, title);
  await approve(page, title);

  const reader = await (await browser.newContext()).newPage();
  await reader.goto("/journal/archive");
  await reader
    .getByRole("article")
    .filter({ hasText: title })
    .getByRole("link", { name: "Read PDF" })
    .click();

  await expect(reader).toHaveURL(/\/login\?next=%2Fapi%2Fjournal/);
  await reader.waitForLoadState("networkidle");

  const pdfResponse = reader.waitForResponse(/\/api\/journal\/.+\/file$/);
  await logIn(reader, email, PASSWORD);
  const response = await pdfResponse;

  expect(response.headers()["content-type"]).toBe("application/pdf");
  expect(response.status()).toBe(200);
});

test("a logged-in reader opens the PDF straight away", async ({ page }) => {
  const email = uniqueEmail();
  const title = uniqueTitle();
  await joinAsMember(page, email);
  await submitWork(page, title);

  await page.goto("/journal/submit");
  const href = await page
    .getByRole("row")
    .filter({ hasText: title })
    .getByRole("link", { name: "View" })
    .getAttribute("href");
  const response = await page.request.get(href as string);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("application/pdf");
});

test("another member cannot read work that is still under review", async ({
  page,
  browser,
}) => {
  const title = uniqueTitle();
  await joinAsMember(page, uniqueEmail());
  await submitWork(page, title);
  await page.goto("/journal/submit");
  const href = await page
    .getByRole("row")
    .filter({ hasText: title })
    .getByRole("link", { name: "View" })
    .getAttribute("href");

  const stranger = await (await browser.newContext()).newPage();
  await signUp(stranger, uniqueEmail());
  const response = await stranger.request.get(href as string);

  expect(response.status()).toBe(404);
});

test("the submit page sends visitors to log in and non-members to join", async ({
  page,
}) => {
  await page.goto("/journal/submit");
  await expect(page).toHaveURL(/\/login\?next=%2Fjournal%2Fsubmit$/);

  await signUp(page, uniqueEmail());
  await page.goto("/journal/submit");

  await expect(page.getByText("active SASS members")).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit Work" })).toHaveCount(0);
});

test("a file that is not a PDF or Word document is refused", async ({ page }) => {
  await joinAsMember(page, uniqueEmail());
  await openSubmitForm(page);
  await fillSubmission(page, uniqueTitle());
  await page.getByLabel("Your File").setInputFiles({
    name: "paper.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("not really a pdf"),
  });

  await page.getByRole("button", { name: "Submit Work" }).click();

  await expect(page.getByText("Please attach a PDF or Word")).toBeVisible();
  await expect(page.getByLabel("Title")).not.toHaveValue("");
});

test("the admin rejects work and the author gets the reason", async ({
  page,
  browser,
}) => {
  const email = uniqueEmail();
  const title = uniqueTitle();
  const memberPage = await (await browser.newContext()).newPage();
  await joinAsMember(memberPage, email);
  await submitWork(memberPage, title);

  await signInAsAdmin(page);
  await page.goto("/admin/journal");
  const row = page.getByRole("row").filter({ hasText: title });
  await row.getByLabel("Reason").fill("Outside the journal's scope");
  await row.getByRole("button", { name: "Reject" }).click();

  await expect(page.getByText("Rejected.")).toBeVisible();
  const mail = await waitForMail(email, /Your journal submission/);
  expect(mail.text).toContain("Outside the journal's scope");
  await memberPage.goto("/journal/archive");
  await expect(memberPage.getByText(title)).toHaveCount(0);
});

test("the admin adds a back issue and can take it down again", async ({ page }) => {
  const title = `Explorations Volume ${Date.now().toString(36)}`;
  await signInAsAdmin(page);
  await page.goto("/admin/journal");
  await page.waitForLoadState("networkidle");

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Authors").fill("SASS Editorial Board");
  await page.getByLabel("Published On").fill("2025-04-01");
  await page.getByLabel("Your File").setInputFiles(PDF);
  await page.getByRole("button", { name: "Add to Journal" }).click();
  await expect(page.getByText("Added to the journal.")).toBeVisible();

  await page.goto("/journal/archive");
  await expect(page.getByText(title)).toBeVisible();

  await page.goto("/admin/journal");
  await page
    .getByRole("row")
    .filter({ hasText: title })
    .getByRole("button", { name: "Remove" })
    .click();
  await expect(page.getByText("Removed from the journal.")).toBeVisible();

  await page.goto("/journal/archive");
  await expect(page.getByText(title)).toHaveCount(0);
});

test("the admin is told when new work arrives", async ({ page }) => {
  const title = uniqueTitle();
  await joinAsMember(page, uniqueEmail());
  await submitWork(page, title);

  await expect
    .poll(() =>
      mailSentTo("southasiansociety2@gmail.com").some((mail) =>
        mail.subject.includes(title)
      )
    )
    .toBe(true);
});
