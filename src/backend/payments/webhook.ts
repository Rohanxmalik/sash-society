import { eq } from "drizzle-orm";
import { payments } from "@/backend/db/schema";
import type { PaymentDeps } from "./deps";
import { findPaymentByOrderId, fulfilPayment } from "./fulfil";

type WebhookEvent = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string | null } };
    refund?: { entity?: { id?: string; payment_id?: string } };
  };
};

async function handleCaptured(deps: PaymentDeps, event: WebhookEvent) {
  const entity = event.payload?.payment?.entity;
  if (!entity?.id || !entity.order_id) return;

  // Razorpay accounts also carry payments from elsewhere, such as payment links.
  const payment = await findPaymentByOrderId(deps.db, entity.order_id);
  if (!payment) return;

  await fulfilPayment(deps, { orderId: entity.order_id, paymentId: entity.id });
}

async function handleRefund(deps: PaymentDeps, event: WebhookEvent) {
  const paymentId = event.payload?.refund?.entity?.payment_id;
  if (!paymentId) return;

  await deps.db
    .update(payments)
    .set({ status: "refunded", refundedAt: deps.now() })
    .where(eq(payments.razorpayPaymentId, paymentId));
}

const HANDLERS: Record<
  string,
  (deps: PaymentDeps, event: WebhookEvent) => Promise<void>
> = {
  "payment.authorized": handleCaptured,
  "payment.captured": handleCaptured,
  "order.paid": handleCaptured,
  "refund.processed": handleRefund,
};

export async function handleWebhookEvent(
  deps: PaymentDeps,
  event: WebhookEvent
) {
  await HANDLERS[event.event ?? ""]?.(deps, event);
}
