import { createHmac, timingSafeEqual } from "node:crypto";

function matches(payload: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(payload).digest();
  const received = Buffer.from(signature, "hex");
  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

export function isValidCheckoutSignature(
  { orderId, paymentId }: { orderId: string; paymentId: string },
  signature: string,
  keySecret: string
) {
  return matches(`${orderId}|${paymentId}`, signature, keySecret);
}

export function isValidWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string
) {
  return matches(rawBody, signature, webhookSecret);
}
