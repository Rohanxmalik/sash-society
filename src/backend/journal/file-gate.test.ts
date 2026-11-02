import { describe, expect, test } from "vitest";
import { withFileSlot } from "./file-gate";

const MAX_FILES = 3;
const done = async () => new Response("done");

function heldSlots() {
  let release = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const slots = Array.from({ length: MAX_FILES }, () =>
    withFileSlot(async () => {
      await held;
      return new Response("done");
    })
  );
  return { release, finished: Promise.all(slots) };
}

describe("withFileSlot", () => {
  test("answers with the work's response", async () => {
    const response = await withFileSlot(done);

    expect(await response.text()).toBe("done");
  });

  test("turns a file away while the slots are full, then lets it in", async () => {
    const { release, finished } = heldSlots();

    const busy = await withFileSlot(done);
    expect(busy.status).toBe(503);
    expect(await busy.json()).toMatchObject({ ok: false });

    release();
    await finished;
    expect((await withFileSlot(done)).status).toBe(200);
  });

  test("gives the slot back when the work fails", async () => {
    const failing = Array.from({ length: MAX_FILES }, () =>
      withFileSlot(async () => {
        throw new Error("database gone");
      })
    );
    await Promise.allSettled(failing);

    expect((await withFileSlot(done)).status).toBe(200);
  });
});
