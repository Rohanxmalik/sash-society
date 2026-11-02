import { getEnv } from "@/backend/env";
import { isValidWebhookSignature } from "@/backend/payments/signature";
import { handleWebhookEvent } from "@/backend/payments/webhook";
import { getPaymentDeps } from "@/backend/runtime";
import { safeLogValue } from "@/backend/safe-log";

export async function POST(request: Request) {
  const secret = getEnv().RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return new Response(null, { status: 503 });

  // Must be the raw text: the signature covers the exact bytes Razorpay sent.
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!isValidWebhookSignature(body, signature, secret)) {
    return new Response(null, { status: 400 });
  }

  try {
    await handleWebhookEvent(getPaymentDeps(), JSON.parse(body));
    return Response.json({ received: true });
  } catch (error) {
    // Razorpay retries on a failed response, which is what we want here.
    console.error("Razorpay webhook failed", safeLogValue(error));
    return new Response(null, { status: 500 });
  }
}
