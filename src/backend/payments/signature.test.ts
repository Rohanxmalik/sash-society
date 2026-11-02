import { describe, expect, test } from "vitest";
import { isValidCheckoutSignature, isValidWebhookSignature } from "./signature";

// Values computed with openssl, independently of this code.
const CHECKOUT_SIGNATURE =
  "5e0781daf9ca49ca8bcdbe2023ee024d94ba973ed2534739a2970c200144e8cc";
const WEBHOOK_SIGNATURE =
  "0e95258623492dd0dae77245c958c256d46b4a30b338084b7e996fc25653c79c";
const WEBHOOK_BODY = '{"event":"payment.captured"}';

describe("isValidCheckoutSignature", () => {
  const params = { orderId: "order_1", paymentId: "pay_1" };

  test("accepts Razorpay's signature", () => {
    expect(
      isValidCheckoutSignature(params, CHECKOUT_SIGNATURE, "key-secret")
    ).toBe(true);
  });

  test("rejects a signature for another payment", () => {
    expect(
      isValidCheckoutSignature(
        { ...params, paymentId: "pay_2" },
        CHECKOUT_SIGNATURE,
        "key-secret"
      )
    ).toBe(false);
  });

  test("rejects a signature made with another secret", () => {
    expect(
      isValidCheckoutSignature(params, CHECKOUT_SIGNATURE, "other-secret")
    ).toBe(false);
  });

  test.each(["", "short", "z".repeat(64)])("rejects the junk value %s", (bad) => {
    expect(isValidCheckoutSignature(params, bad, "key-secret")).toBe(false);
  });
});

describe("isValidWebhookSignature", () => {
  test("accepts Razorpay's signature over the raw body", () => {
    expect(
      isValidWebhookSignature(WEBHOOK_BODY, WEBHOOK_SIGNATURE, "webhook-secret")
    ).toBe(true);
  });

  test("rejects a changed body", () => {
    expect(
      isValidWebhookSignature(
        '{"event":"payment.captured" }',
        WEBHOOK_SIGNATURE,
        "webhook-secret"
      )
    ).toBe(false);
  });
});
