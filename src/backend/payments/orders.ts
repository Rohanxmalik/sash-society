import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { eventRegistrations, payments } from "@/backend/db/schema";
import { findLiveMembership } from "@/backend/members/repository";
import { displayStatus } from "@/backend/members/rules";
import { findProfile } from "@/backend/profiles/repository";
import { safeLogValue } from "@/backend/safe-log";
import type { CheckoutOrder, CheckoutResult } from "@/shared/checkout";
import { findEvent, openOption } from "@/shared/events";
import { findPlan } from "@/shared/plans";
import { eventRegistrationSchema } from "@/shared/validation/event";
import { membershipCheckoutSchema } from "@/shared/validation/membership";
import type { PaymentDeps } from "./deps";
import type { CreateOrderInput } from "./gateway";

const RECEIPT_LENGTH = 32;
const START_FAILED = "We could not start the payment. Please try again.";

type Buyer = { id: string; name: string; email: string };

const fail = (message: string): CheckoutResult => ({ ok: false, message });

async function startGatewayOrder(
  { gateway }: PaymentDeps,
  input: Omit<CreateOrderInput, "receipt">
) {
  try {
    const receipt = randomUUID().replaceAll("-", "").slice(0, RECEIPT_LENGTH);
    return await gateway.createOrder({ ...input, receipt });
  } catch (error) {
    console.error("Failed to create payment order", safeLogValue(error));
    return null;
  }
}

function toCheckoutOrder(
  { gateway }: PaymentDeps,
  order: Omit<CheckoutOrder, "provider" | "keyId" | "fakeResponse">
): CheckoutOrder {
  return {
    ...order,
    provider: gateway.provider,
    keyId: gateway.keyId,
    fakeResponse: gateway.checkoutResponse?.(order),
  };
}

export async function createMembershipOrder(
  deps: PaymentDeps,
  buyer: Buyer,
  input: unknown
): Promise<CheckoutResult> {
  const parsed = membershipCheckoutSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const plan = findPlan(parsed.data.planSlug);
  if (!plan) return fail("This membership plan is not available.");

  // Printed on the certificate, so personal plans must not be able to set it.
  const organisationName = plan.isOrganisation
    ? parsed.data.organisationName
    : undefined;
  if (plan.isOrganisation && !organisationName) {
    return fail("Please enter the name of your organisation.");
  }

  const now = deps.now();
  const live = await findLiveMembership(deps.db, buyer.id);
  if (live && displayStatus(live, now) !== "expired") {
    return fail("You already have a membership.");
  }

  const { amountMinor, currency, name: description } = plan;
  const order = await startGatewayOrder(deps, {
    amountMinor,
    currency,
    notes: { purpose: "membership", plan: plan.slug },
  });
  if (!order) return fail(START_FAILED);

  await deps.db.insert(payments).values({
    purpose: "membership",
    status: "created",
    description,
    amountMinor,
    currency,
    userId: buyer.id,
    planSlug: plan.slug,
    organisationName,
    declarationAcceptedAt: now,
    razorpayOrderId: order.id,
  });

  const profile = await findProfile(deps.db, buyer.id);
  return {
    ok: true,
    order: toCheckoutOrder(deps, {
      orderId: order.id,
      amountMinor,
      currency,
      description,
      prefill: {
        name: profile?.fullName ?? buyer.name,
        email: buyer.email,
        contact: profile?.phone,
      },
    }),
  };
}

export async function createEventOrder(
  deps: PaymentDeps,
  input: unknown,
  userId: string | null
): Promise<CheckoutResult> {
  const parsed = eventRegistrationSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { eventId, optionId, email, fullName, whatsapp } = parsed.data;
  const event = findEvent(eventId);
  if (!event?.registration) {
    return fail("This event is not open for registration.");
  }

  const option = openOption(event, optionId, deps.now());
  if (!option) return fail("Registration for this option has closed.");

  const [existing] = await deps.db
    .select({ id: eventRegistrations.id })
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.email, email),
        eq(eventRegistrations.status, "confirmed")
      )
    )
    .limit(1);
  if (existing) return fail("This email is already registered for this event.");

  const { amountMinor, currency } = option;
  const description = `${event.title} (${option.label})`;
  const order = await startGatewayOrder(deps, {
    amountMinor,
    currency,
    notes: { purpose: "event", event: eventId, option: optionId },
  });
  if (!order) return fail(START_FAILED);

  const [registration] = await deps.db
    .insert(eventRegistrations)
    .values({ ...parsed.data, userId, status: "pending_payment" })
    .returning({ id: eventRegistrations.id });
  await deps.db.insert(payments).values({
    purpose: "event",
    status: "created",
    description,
    amountMinor,
    currency,
    userId,
    eventRegistrationId: registration.id,
    razorpayOrderId: order.id,
  });

  return {
    ok: true,
    order: toCheckoutOrder(deps, {
      orderId: order.id,
      amountMinor,
      currency,
      description,
      prefill: { name: fullName, email, contact: whatsapp },
    }),
  };
}
