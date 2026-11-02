import { describe, expect, it, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/backend/db", () => ({
  getDb: () => {
    throw new Error("The ping must not touch the database");
  },
}));

describe("GET /api/ping", () => {
  it("answers without touching the database", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  it("is never cached, so each ping reaches the server", () => {
    expect(GET().headers.get("cache-control")).toBe("no-store");
  });
});
