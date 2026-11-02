"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { startMembershipCheckoutAction } from "@/backend/payments/actions";
import { Celebration } from "@/frontend/components/payment/celebration";
import { useCheckout } from "@/frontend/components/payment/use-checkout";
import { Button } from "@/frontend/components/ui/button";
import { FormAlert } from "@/frontend/components/ui/form-alert";
import { FormField } from "@/frontend/components/ui/form-field";
import { formatMoney } from "@/shared/money";
import type { MembershipPlan } from "@/shared/plans";

export function JoinDialog({
  plan,
  onClose,
}: {
  plan: MembershipPlan;
  onClose: () => void;
}) {
  const { pay, busy, problem, outcome } = useCheckout();
  const [accepted, setAccepted] = useState(false);
  const [organisationName, setOrganisationName] = useState("");

  if (outcome) return <Celebration outcome={outcome} />;

  const price = formatMoney(plan.amountMinor, plan.currency);
  const ready = accepted && (!plan.isOrganisation || organisationName.trim());

  const startPayment = () =>
    pay(() =>
      startMembershipCheckoutAction({
        planSlug: plan.slug,
        declarationAccepted: accepted,
        organisationName,
      })
    );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={plan.name}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 backdrop-blur-sm px-4"
    >
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1 text-ink-muted hover:text-ink cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-black text-ink font-heading pr-6">
          {plan.name}
        </h2>
        <p className="mt-1 text-2xl font-black text-brand-dark-teal font-heading">
          {price}
        </p>

        {plan.requiresApproval && (
          <p className="mt-4 text-sm text-ink-light">
            This plan needs committee approval. Your certificate is issued once
            approved. If it is not approved, your payment is refunded.
          </p>
        )}

        <div className="mt-5 space-y-4">
          {problem && <FormAlert>{problem}</FormAlert>}

          {plan.isOrganisation && (
            <FormField
              label="Organisation Name *"
              value={organisationName}
              onChange={(event) => setOrganisationName(event.target.value)}
            />
          )}

          <label className="flex gap-3 text-sm text-ink-light cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-0.5 accent-brand-dark-teal"
            />
            <span>
              I confirm that I meet the eligibility for this plan:{" "}
              {plan.eligibility}. I agree to the{" "}
              <Link href="/terms" className="text-brand-teal hover:underline">
                terms
              </Link>{" "}
              and{" "}
              <Link
                href="/refund-policy"
                className="text-brand-teal hover:underline"
              >
                refund policy
              </Link>
              .
            </span>
          </label>

          <Button
            type="button"
            className="w-full"
            disabled={!ready || busy}
            onClick={startPayment}
          >
            {busy ? "Opening..." : `Pay ${price}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
