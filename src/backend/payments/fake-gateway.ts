import { createHmac, randomUUID } from "node:crypto";
import type { Gateway, OrderSummary, RemotePaymentStatus } from "./gateway";
import { isValidCheckoutSignature } from "./signature";

const FAKE_SECRET = "fake-gateway-secret";
const SEPARATOR = "~";

// Runs the whole payment path without Razorpay, for tests and local development.
// parseEnv refuses to start production without real keys, so it cannot go live.
export function createFakeGateway() {
  let status: RemotePaymentStatus = "captured";
  const captured: {
    paymentId: string;
    amountMinor: number;
    currency: string;
  }[] = [];
  const refunded: string[] = [];

  const paymentIdFor = ({ orderId, amountMinor, currency }: OrderSummary) =>
    ["pay_fake", orderId, amountMinor, currency].join(SEPARATOR);

  const checkoutResponse = (order: OrderSummary) => {
    const paymentId = paymentIdFor(order);
    const signature = createHmac("sha256", FAKE_SECRET)
      .update(`${order.orderId}|${paymentId}`)
      .digest("hex");
    return { orderId: order.orderId, paymentId, signature };
  };

  const gateway: Gateway = {
    provider: "fake",
    keyId: "rzp_fake",

    async createOrder() {
      return { id: `order_fake_${randomUUID()}` };
    },

    async fetchPayment(paymentId) {
      const [, orderId, amountMinor, currency] = paymentId.split(SEPARATOR);
      return {
        id: paymentId,
        orderId,
        amountMinor: Number(amountMinor),
        currency,
        status,
      };
    },

    async capturePayment(paymentId, amountMinor, currency) {
      captured.push({ paymentId, amountMinor, currency });
    },

    async refundPayment(paymentId) {
      refunded.push(paymentId);
    },

    isValidSignature({ orderId, paymentId, signature }) {
      return isValidCheckoutSignature(
        { orderId, paymentId },
        signature,
        FAKE_SECRET
      );
    },

    checkoutResponse,
  };

  return {
    ...gateway,
    captured,
    refunded,
    paymentIdFor,
    checkoutResponse,
    setStatus(next: RemotePaymentStatus) {
      status = next;
    },
  };
}
