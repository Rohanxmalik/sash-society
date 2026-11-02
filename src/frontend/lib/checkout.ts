import type { CheckoutOrder, CheckoutResponse } from "@/shared/checkout";
import { clientConfig } from "@/shared/client-config";

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const BRAND_COLOR = "#0f4c5c";

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open(): void };
  }
}

let scriptLoading: Promise<void> | undefined;

function loadRazorpay() {
  scriptLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoading = undefined;
      reject(new Error("Could not load Razorpay"));
    };
    document.body.append(script);
  });
  return scriptLoading;
}

// Resolves to null when the person closes the popup without paying.
export async function openCheckout(
  order: CheckoutOrder
): Promise<CheckoutResponse | null> {
  if (order.fakeResponse) return order.fakeResponse;

  await loadRazorpay();
  const Razorpay = window.Razorpay;
  if (!Razorpay) throw new Error("Razorpay did not load");

  return new Promise((resolve) => {
    new Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amountMinor,
      currency: order.currency,
      name: clientConfig.society.name,
      description: order.description,
      image: `${window.location.origin}/images/logo.png`,
      prefill: order.prefill,
      theme: { color: BRAND_COLOR },
      handler: (response: RazorpaySuccess) =>
        resolve({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        }),
      modal: { ondismiss: () => resolve(null) },
    }).open();
  });
}
