import { describe, expect, it } from "vitest";
import { clientAddress } from "./client-ip";

describe("clientAddress", () => {
  it("reads the address set by the edge", () => {
    const headers = new Headers({ "cf-connecting-ip": "203.0.113.7" });

    expect(clientAddress(headers)).toBe("203.0.113.7");
  });

  it("ignores headers a visitor can set themselves", () => {
    const headers = new Headers({
      "x-real-ip": "198.51.100.1",
      "x-forwarded-for": "198.51.100.2",
    });

    expect(clientAddress(headers)).toBe("unknown");
  });
});
