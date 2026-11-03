import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  findEvent,
  isOptionOpen,
  openOption,
  previousEvents,
  upcomingEvents,
} from "./events";

const event = findEvent("mauritius-2027");
const offline = event?.registration?.options.find((o) => o.id === "offline");

describe("conference records", () => {
  test.each([...upcomingEvents, ...previousEvents].map((e) => [e.id, e.image]))(
    "the image for %s is on disk",
    (_id, image) => {
      expect(existsSync(path.join("public", image ?? ""))).toBe(true);
    }
  );

  test("the 1st conference matches its programme", () => {
    expect(findEvent("1st-international-conference")).toMatchObject({
      theme: "Sociology in South Asia",
      date: "2023-11-28",
      endDate: "2023-11-29",
      location: "Online",
    });
  });

  test.each(previousEvents.map((e) => [e.id, e] as const))(
    "%s has its brochure on the site",
    (_id, conference) => {
      expect(conference.brochure?.concept.length).toBeGreaterThan(0);
      expect(conference.brochure?.subThemes.length).toBeGreaterThan(0);
    }
  );

  test("past brochures leave out payment and private contact details", () => {
    const text = JSON.stringify(previousEvents);

    for (const hidden of ["gmail", "925020058201066", "IFSC", "forms.gle", "+91", "Mob."]) {
      expect(text).not.toContain(hidden);
    }
  });

  test("every special lecture poster is on disk", () => {
    const posters = previousEvents.flatMap(
      (e) => e.brochure?.lectures?.map((lecture) => lecture.poster) ?? []
    );

    expect(posters).toHaveLength(5);
    for (const poster of posters) {
      expect(existsSync(path.join("public", poster))).toBe(true);
    }
  });

  test("the 3rd conference matches its brochure", () => {
    expect(findEvent("3rd-international-conference")).toMatchObject({
      theme:
        "Science, Technology, and Society: Rethinking Knowledge, Power, and Innovation for an Inclusive and Sustainable Future",
      location: "Singapore & Malaysia",
      galleryLink: "/conferences/gallery",
    });
  });
});

describe("isOptionOpen", () => {
  test("stays open until the end of the last day in India", () => {
    // 25 Nov 23:30 IST
    expect(isOptionOpen(offline!, new Date("2026-11-25T18:00:00Z"))).toBe(true);
  });

  test("closes at midnight in India", () => {
    // 26 Nov 00:00 IST
    expect(isOptionOpen(offline!, new Date("2026-11-25T18:30:00Z"))).toBe(false);
  });
});

describe("openOption", () => {
  test("finds a fee option while it is open", () => {
    const option = openOption(event!, "offline", new Date("2026-11-20T00:00:00Z"));

    expect(option?.amountMinor).toBe(500_000);
  });

  test("returns nothing after that option has closed", () => {
    expect(
      openOption(event!, "offline", new Date("2026-12-01T00:00:00Z"))
    ).toBeUndefined();
  });

  test("keeps online registration open after offline closes", () => {
    const option = openOption(event!, "online", new Date("2026-12-01T00:00:00Z"));

    expect(option?.amountMinor).toBe(200_000);
  });

  test("returns nothing for an option that does not exist", () => {
    expect(
      openOption(event!, "vip", new Date("2026-11-20T00:00:00Z"))
    ).toBeUndefined();
  });
});
