import type { Gateway, RemotePaymentStatus } from "./gateway";
import { isValidCheckoutSignature } from "./signature";

const API_BASE = "https://api.razorpay.com/v1";
const TIMEOUT_MS = 15_000;

type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: RemotePaymentStatus;
};

export function createRazorpayGateway({
  keyId,
  keySecret,
}: {
  keyId: string;
  keySecret: string;
}): Gateway {
  const authorization = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

  async function call<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: { authorization, "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const reason = data?.error?.description ?? `status ${response.status}`;
      throw new Error(`Razorpay request failed: ${reason}`);
    }
    return data as T;
  }

  const paymentPath = (paymentId: string) =>
    `/payments/${encodeURIComponent(paymentId)}`;

  return {
    provider: "razorpay",
    keyId,

    async createOrder({ amountMinor, currency, receipt, notes }) {
      const order = await call<{ id: string }>("/orders", {
        amount: amountMinor,
        currency,
        receipt,
        notes,
      });
      return { id: order.id };
    },

    async fetchPayment(paymentId) {
      const payment = await call<RazorpayPayment>(paymentPath(paymentId));
      return {
        id: payment.id,
        orderId: payment.order_id,
        amountMinor: payment.amount,
        currency: payment.currency,
        status: payment.status,
      };
    },

    async capturePayment(paymentId, amountMinor, currency) {
      await call(`${paymentPath(paymentId)}/capture`, {
        amount: amountMinor,
        currency,
      });
    },

    async refundPayment(paymentId) {
      await call(`${paymentPath(paymentId)}/refund`, {});
    },

    isValidSignature({ orderId, paymentId, signature }) {
      return isValidCheckoutSignature(
        { orderId, paymentId },
        signature,
        keySecret
      );
    },
  };
}
