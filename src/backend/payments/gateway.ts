import type { CheckoutResponse } from "@/shared/checkout";

export type RemotePaymentStatus =
  | "created"
  | "authorized"
  | "captured"
  | "refunded"
  | "failed";

export interface RemotePayment {
  id: string;
  orderId: string;
  amountMinor: number;
  currency: string;
  status: RemotePaymentStatus;
}

export interface CreateOrderInput {
  amountMinor: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}

export interface OrderSummary {
  orderId: string;
  amountMinor: number;
  currency: string;
}

export interface Gateway {
  provider: "razorpay" | "fake";
  keyId: string;
  createOrder(input: CreateOrderInput): Promise<{ id: string }>;
  fetchPayment(paymentId: string): Promise<RemotePayment>;
  capturePayment(
    paymentId: string,
    amountMinor: number,
    currency: string
  ): Promise<void>;
  refundPayment(paymentId: string): Promise<void>;
  isValidSignature(response: CheckoutResponse): boolean;
  // Only the fake gateway has this. It stands in for the Razorpay popup.
  checkoutResponse?(order: OrderSummary): CheckoutResponse;
}
