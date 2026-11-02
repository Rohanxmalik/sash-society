export interface CheckoutResponse {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface CheckoutOrder {
  provider: "razorpay" | "fake";
  keyId: string;
  orderId: string;
  amountMinor: number;
  currency: string;
  description: string;
  prefill: { name: string; email: string; contact?: string };
  // Development only, stands in for the Razorpay popup.
  fakeResponse?: CheckoutResponse;
}

export type CheckoutResult =
  | { ok: true; order: CheckoutOrder }
  | { ok: false; message: string };

export type PaymentOutcome = "active" | "pending_approval" | "registered";

export type ConfirmResult =
  | { ok: true; outcome: PaymentOutcome }
  | { ok: false; message: string };
