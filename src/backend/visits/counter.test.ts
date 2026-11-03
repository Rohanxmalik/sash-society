import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { counters } from "@/backend/db/schema";
import { createHarness, type Harness } from "@/backend/test/harness";
import { createVisitCounter } from "./counter";

const HOUR_MS = 60 * 60 * 1000;

let harness: Harness;
let time: number;
const db = () => harness.testDb.db;
const now = () => time;

const savedTotal = async () => {
  const [row] = await db()
    .select({ value: counters.value })
    .from(counters)
    .where(eq(counters.key, "site-visits"));
  return row?.value;
};

beforeEach(async () => {
  harness = await createHarness();
  time = 1_000_000;
});

afterEach(async () => {
  await harness.testDb.close();
  vi.restoreAllMocks();
});

describe("createVisitCounter", () => {
  test("starts from zero", async () => {
    expect(await createVisitCounter({ db: db(), now }).total()).toBe(0);
  });

  test("counts each visit", async () => {
    const counter = createVisitCounter({ db: db(), now });

    await counter.record();

    expect(await counter.record()).toBe(2);
    expect(await counter.total()).toBe(2);
  });

  test("saves the first visit after a start straight away", async () => {
    await createVisitCounter({ db: db(), now }).record();

    expect(await savedTotal()).toBe(1);
  });

  test("keeps counting if the server restarts within every hour", async () => {
    await createVisitCounter({ db: db(), now }).record();
    await createVisitCounter({ db: db(), now }).record();

    expect(await savedTotal()).toBe(2);
  });

  test("holds later visits in memory between saves", async () => {
    const counter = createVisitCounter({ db: db(), now });

    await counter.record();
    await counter.record();
    await counter.record();

    expect(await savedTotal()).toBe(1);
    expect(await counter.total()).toBe(3);
  });

  test("saves a batch once an hour has passed", async () => {
    const counter = createVisitCounter({ db: db(), now });
    await counter.record();

    time += HOUR_MS;
    await counter.record();

    expect(await savedTotal()).toBe(2);
    expect(await counter.total()).toBe(2);
  });

  test("adds to what is already saved", async () => {
    const counter = createVisitCounter({ db: db(), now });
    await counter.record();
    time += HOUR_MS;
    await counter.record();

    await counter.record();
    time += HOUR_MS;
    await counter.record();

    expect(await savedTotal()).toBe(4);
  });

  test("a restarted server carries on from the saved total", async () => {
    const first = createVisitCounter({ db: db(), now });
    await first.record();
    time += HOUR_MS;
    await first.record();

    const restarted = createVisitCounter({ db: db(), now });

    expect(await restarted.record()).toBe(3);
  });

  test("keeps unsaved visits when a save fails", async () => {
    const counter = createVisitCounter({ db: db(), now });
    await counter.record();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const insert = vi.spyOn(db(), "insert").mockImplementationOnce(() => {
      throw new Error("database asleep");
    });

    time += HOUR_MS;
    expect(await counter.record()).toBe(2);

    insert.mockRestore();
    time += HOUR_MS;
    await counter.record();
    expect(await savedTotal()).toBe(3);
  });

  test("reading the total does not touch the database again", async () => {
    const counter = createVisitCounter({ db: db(), now });
    await counter.total();
    const select = vi.spyOn(db(), "select");

    await counter.total();
    await counter.total();

    expect(select).not.toHaveBeenCalled();
  });
});
