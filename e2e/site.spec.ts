import { expect, test, type Page } from "@playwright/test";
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
    .poll(() => mailSentTo("info@sass-socio.org").some((m) => m.text.includes(email)))
    .toBe(true);
});

test("the footer links to every social profile", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");

  for (const name of ["X", "Instagram", "Facebook", "LinkedIn", "YouTube"]) {
    await expect(footer.getByRole("link", { name, exact: true })).toBeVisible();
  }
});

test("a social link with no profile yet stays on the page", async ({ page }) => {
  await page.goto("/about");

  const link = page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Instagram", exact: true });
  await expect(link).not.toHaveAttribute("target", "_blank");
  await link.click();

  await expect(page).toHaveURL(/\/about$/);
});

test("the footer credits GenosAI with a link to its website", async ({ page }) => {
  await page.goto("/");

  const credit = page.getByRole("contentinfo").getByRole("link", { name: "GenosAI" });

  await expect(credit).toHaveAttribute("href", "https://genosai.tech");
  await expect(page.getByRole("contentinfo")).toContainText(
    "Designed and developed by GenosAI"
  );
});

test.describe("GenosAI credit", () => {
  const credit = (page: Page) =>
    page.getByRole("contentinfo").getByRole("link", { name: /GenosAI/ });
  const shimmerAnimation = (page: Page) =>
    credit(page)
      .getByText("GenosAI", { exact: true })
      .evaluate((name) => getComputedStyle(name).animationName);

  test("sits at the bottom right on one line", async ({ page }) => {
    await page.goto("/about");
    await credit(page).scrollIntoViewIfNeeded();

    const box = (await credit(page).boundingBox())!;
    const copyright = (await page.getByText("All rights reserved").boundingBox())!;
    const { width } = page.viewportSize()!;

    expect(box.x).toBeGreaterThan(width / 2);
    expect(box.y + box.height).toBeGreaterThan(copyright.y);
    expect(box.height).toBeLessThan(50);
  });

  test("the name shimmers", async ({ page }) => {
    await page.goto("/about");

    expect(await shimmerAnimation(page)).toBe("credit-shimmer");
  });

  test("stays still for visitors who prefer less motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/about");

    expect(await shimmerAnimation(page)).toBe("none");
  });

  test("fits on a phone without pushing the page sideways", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/about");
    await credit(page).scrollIntoViewIfNeeded();

    const box = (await credit(page).boundingBox())!;
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );

    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(360);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("homepage", () => {
  test("leads with the society's name", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toContainText("SOCIOLOGICAL");
    await expect(heading).toContainText("SOCIETY");
    await expect(heading).toContainText("(SASS)");
    await expect(
      page.getByRole("main").getByText("Advancing Sociological Research", { exact: true })
    ).toBeVisible();
  });

  test("links to every important section", async ({ page }) => {
    await page.goto("/");
    const links = page.getByRole("navigation", { name: "Quick links" });

    for (const name of [
      "Register for Mauritius 2027",
      "Become a Member",
      "Members List",
      "Journal",
      "Conferences",
      "Committees",
      "Photo Gallery",
      "Achievement Awards",
    ]) {
      await expect(links.getByRole("link", { name, exact: true })).toBeVisible();
    }
  });

  test("the committees link lands on the committees in About Us", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("navigation", { name: "Quick links" })
      .getByRole("link", { name: "Committees", exact: true })
      .click();

    await expect(page).toHaveURL(/\/about#committees$/);
    await expect(page.getByRole("heading", { name: "Our Committees" })).toBeVisible();
  });
});

test.describe("About Us", () => {
  test("shows the International Committee first", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByText("Prof. Roberto Cipriani")).toBeAttached();
  });

  for (const [tab, member] of [
    ["Advisory", "Prof. K. L. Sharma"],
    ["National", "Prof. Bibhuti Bhushan Malik"],
    ["Regional", "Dr. Swati D Khairnar"],
  ]) {
    test(`shows the ${tab} Committee with photos`, async ({ page }) => {
      await page.goto("/about");

      await page.getByRole("button", { name: tab, exact: true }).click();

      const photo = page.getByRole("img", { name: member, exact: true });
      await photo.scrollIntoViewIfNeeded();
      await expect(photo).toBeVisible();
      await expect
        .poll(() => photo.evaluate((image: HTMLImageElement) => image.naturalWidth))
        .toBeGreaterThan(0);
    });
  }
});

test.describe("conference brochures", () => {
  const CONFERENCES = [
    ["1st-international-conference", "Sociology in South Asia"],
    ["2nd-international-conference", "South Asian Society: Today and Tomorrow"],
    ["3rd-international-conference", "Science, Technology, and Society"],
    ["mauritius-2027", "Artificial Intelligence and Society"],
  ];

  for (const [id, theme] of CONFERENCES) {
    test(`${id} has a page with Save as PDF`, async ({ page }) => {
      await page.goto(`/conferences/${id}`);

      await expect(page.getByRole("main")).toContainText(theme);
      await expect(page.getByRole("button", { name: "Save as PDF" })).toBeVisible();
    });
  }

  test("each conference card opens its brochure", async ({ page }) => {
    await page.goto("/conferences");

    await expect(page.getByRole("link", { name: "View Brochure" })).toHaveCount(4);
    await page.getByRole("link", { name: "View Brochure" }).nth(2).click();

    await expect(page).toHaveURL(/\/conferences\/2nd-international-conference$/);
  });

  test("past conferences also link from Previous Events", async ({ page }) => {
    await page.goto("/events/previous");

    await expect(page.getByRole("link", { name: "View Brochure" })).toHaveCount(3);
  });

  test("Save as PDF opens the browser's print window", async ({ page }) => {
    await page.addInitScript(() => {
      const counted = window as unknown as { prints: number };
      counted.prints = 0;
      window.print = () => {
        counted.prints += 1;
      };
    });
    await page.goto("/conferences/2nd-international-conference");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Save as PDF" }).click();

    expect(
      await page.evaluate(() => (window as unknown as { prints: number }).prints)
    ).toBe(1);
  });

  test("the saved copy leaves out the site's menus and buttons", async ({ page }) => {
    await page.goto("/conferences/3rd-international-conference");
    await page.emulateMedia({ media: "print" });

    await expect(page.getByRole("banner")).toBeHidden();
    await expect(page.getByRole("contentinfo")).toBeHidden();
    await expect(page.getByRole("button", { name: "Save as PDF" })).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("the Dubai page lists its four special lectures", async ({ page }) => {
    await page.goto("/conferences/2nd-international-conference");

    for (const title of [
      "Globalisation and its Impact on Indian Society",
      "Practice of Sociology in South Asia: Some Converging Themes",
      "Ambedkarism: Philosophy, Epistemology, and Theory",
      "Explaining Culture: As an Interpretive and Pragmatic Phenomenon",
    ]) {
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
    }
  });

  test("a past brochure shows no bank or registration details", async ({ page }) => {
    await page.goto("/conferences/3rd-international-conference");

    const text = await page.getByRole("main").innerText();

    expect(text).not.toContain("IFSC");
    expect(text).not.toContain("Account");
    expect(text).not.toContain("gmail");
  });

  test("an unknown conference is not found", async ({ page }) => {
    const response = await page.goto("/conferences/not-a-conference");

    expect(response?.status()).toBe(404);
  });
});

test.describe("visitor counter", () => {
  const counter = (page: Page) =>
    page.getByRole("contentinfo").getByText("Total Visitors");

  test("the footer shows the total", async ({ page }) => {
    await page.goto("/about");

    await expect(counter(page)).toContainText(/\d/);
  });

  test("a browser is counted once a day, however often it reloads", async ({ page }) => {
    const counted: string[] = [];
    page.on("request", (request) => {
      if (request.url().endsWith("/api/visits")) counted.push(request.method());
    });

    await page.goto("/about");
    await expect(counter(page)).toContainText(/\d/);
    await page.reload();
    await expect(counter(page)).toContainText(/\d/);

    expect(counted.filter((method) => method === "POST")).toHaveLength(1);
  });
});

test("the only email address on the site is the society's", async ({ page }) => {
  await page.goto("/contact");

  const mailLinks = await page
    .locator('a[href^="mailto:"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

  expect(new Set(mailLinks)).toEqual(new Set(["mailto:info@sass-socio.org"]));
});

test("the journal shows its featured publication as coming soon", async ({
  page,
}) => {
  await page.goto("/journal");

  await expect(page.getByText("Featured Publication")).toBeVisible();
  await expect(page.getByText("Coming Soon")).toBeVisible();
  await expect(page.getByText("Special Edition")).toHaveCount(0);
  await expect(page.getByText("Primary publication vehicle")).toHaveCount(0);
});

test.describe("scroll animations", () => {
  const LONG_PAGES = ["/about", "/constitution", "/membership", "/journal"];
  const hidden = '[data-reveal="hidden"]';

  async function scrollToBottom(page: Page) {
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let top = 0; top < height; top += 300) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);
      await page.waitForTimeout(50);
    }
  }

  for (const path of LONG_PAGES) {
    test(`${path} reveals everything as the visitor scrolls`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(hidden).first()).toBeAttached();

      await scrollToBottom(page);

      await expect(page.locator(hidden)).toHaveCount(0);
    });
  }

  test("the first screen is never hidden", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator(hidden).first()).toBeAttached();

    const animatingOnArrival = await page.locator('[data-reveal="shown"]').count();
    const tops = await page
      .locator(hidden)
      .evaluateAll((blocks) =>
        blocks.map((block) => block.getBoundingClientRect().top)
      );

    expect(animatingOnArrival).toBe(0);
    expect(Math.min(...tops)).toBeGreaterThan(page.viewportSize()!.height);
  });

  test("visitors who prefer less motion see no animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/about");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("[data-reveal]")).toHaveCount(0);
  });

  test("animates again after moving to another page", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator(hidden).first()).toBeAttached();

    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Constitution" })
      .click();
    await expect(page).toHaveURL(/\/constitution$/);

    await expect(page.locator(hidden).first()).toBeAttached();
  });

  test("the home page's own animations are not animated twice", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("[data-scroll-animated]").first()).toBeAttached();
    await page.waitForLoadState("networkidle");

    await expect(
      page.locator(
        "[data-reveal][data-scroll-animated], [data-reveal] [data-scroll-animated], [data-scroll-animated] [data-reveal]"
      )
    ).toHaveCount(0);
  });
});

test("the policies a payment provider checks for are all linked in the footer", async ({
  page,
}) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");

  for (const name of [
    "Privacy Policy",
    "Terms & Conditions",
    "Cancellation & Refund Policy",
    "Shipping & Delivery Policy",
  ]) {
    await footer.getByRole("link", { name }).click();
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await page.goBack();
  }
});

test("the header has a solid background on inner pages", async ({ page }) => {
  await page.goto("/about");

  await expect(page.getByRole("banner")).not.toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)"
  );
});

test("the header stays see-through at the top of the home page", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("banner")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)"
  );
});

test("the gallery page loads without broken images", async ({ page }) => {
  await page.goto("/conferences/gallery");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('img[src*="sass-socio.org"]')).toHaveCount(0);
});

test.describe("conference photos", () => {
  for (const name of [
    "3rd Conference (Singapore & Malaysia 2026)",
    "2nd Conference (Dubai 2025)",
    "1st Conference (Online 2023)",
  ]) {
    test(`the gallery shows photos from the ${name}`, async ({ page }) => {
      await page.goto("/conferences/gallery");

      await page.getByRole("button", { name, exact: true }).click();

      const first = page.getByRole("img", { name: `${name} - Photo 1`, exact: true });
      await expect(first).toBeVisible();
      await expect
        .poll(() => first.evaluate((image: HTMLImageElement) => image.naturalWidth))
        .toBeGreaterThan(0);
    });
  }

  test("a gallery photo opens larger", async ({ page }) => {
    await page.goto("/conferences/gallery");

    await page
      .getByRole("button")
      .filter({ has: page.getByRole("img") })
      .first()
      .click();

    await expect(page.locator(".yarl__slide_current img")).toBeVisible();
  });

  test("every past conference card has a real photo", async ({ page }) => {
    await page.goto("/events/previous");

    const images = page.locator("main article img, main .grid img");
    await expect(images).toHaveCount(3);

    for (let index = 0; index < 3; index += 1) {
      await images.nth(index).scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          images.nth(index).evaluate((image: HTMLImageElement) => image.naturalWidth)
        )
        .toBeGreaterThan(0);
    }
  });
});

test("the chronology gives the true date of the first conference", async ({ page }) => {
  await page.goto("/conferences/chronology");

  await expect(page.getByText("2023", { exact: true })).toBeVisible();
  await expect(page.getByText("Sociology in South Asia")).toBeVisible();
  await expect(page.getByText("Singapore & Malaysia")).toBeVisible();
  await expect(page.getByText("Social Change", { exact: false })).toHaveCount(0);
  await expect(page.getByText("Contemporary Social Transformations")).toHaveCount(0);
});

test("the awards page honours both recipients", async ({ page }) => {
  await page.goto("/achievement-awards");

  await expect(page.getByRole("heading", { name: "Prof. S. Gurusamy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Prof. Rajen Suntoo" })).toBeVisible();
  await expect(page.getByText("Coming Soon")).toHaveCount(0);

  const photo = page.getByRole("img", { name: /Prof\. S\. Gurusamy/ });
  await expect
    .poll(() => photo.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
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
