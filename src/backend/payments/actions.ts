"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getSession, requireSession } from "@/backend/auth/session";
import { clientAddress } from "@/backend/client-ip";
import { createRateLimiter } from "@/backend/rate-limit";
import { getPaymentDeps } from "@/backend/runtime";
import type { CheckoutResult, ConfirmResult } from "@/shared/checkout";
import { confirmPayment } from "./fulfil";
import { createEventOrder, createMembershipOrder } from "./orders";

const TEN_MINUTES_MS = 10 * 60 * 1000;
const CHECKOUT_LIMIT = { limit: 10, windowMs: TEN_MINUTES_MS };
const TOO_MANY_ATTEMPTS: CheckoutResult = {
  ok: false,
  message: "Too many attempts. Please wait a few minutes and try again.",
};

const allowGuestCheckout = createRateLimiter(CHECKOUT_LIMIT);
const allowMemberCheckout = createRateLimiter(CHECKOUT_LIMIT);

export async function startMembershipCheckoutAction(
  input: unknown
): Promise<CheckoutResult> {
  const { user } = await requireSession();
  if (!allowMemberCheckout(user.id)) return TOO_MANY_ATTEMPTS;

  return createMembershipOrder(getPaymentDeps(), user, input);
}

// Open to guests, so each visitor is limited to stop bots filling the order book.
export async function startEventCheckoutAction(
  input: unknown
): Promise<CheckoutResult> {
  const address = clientAddress(await headers());
  if (!allowGuestCheckout(address)) return TOO_MANY_ATTEMPTS;

  const session = await getSession();
  return createEventOrder(getPaymentDeps(), input, session?.user.id ?? null);
}

export async function confirmPaymentAction(
  response: unknown
): Promise<ConfirmResult> {
  const result = await confirmPayment(getPaymentDeps(), response);
  if (result.ok) {
    revalidatePath("/profile");
    revalidatePath("/membership");
  }
  return result;
}
