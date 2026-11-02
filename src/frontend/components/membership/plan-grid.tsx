"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import { formatMoney } from "@/shared/money";
import {
  membershipPlans,
  periodLabel,
  type MembershipPlan,
} from "@/shared/plans";
import { JoinDialog } from "./join-dialog";

const signupPath = (plan: MembershipPlan) =>
  `/signup?next=${encodeURIComponent(`/membership?plan=${plan.slug}`)}`;

function PlanAction({
  plan,
  signedIn,
  currentPlanSlug,
  onJoin,
}: {
  plan: MembershipPlan;
  signedIn: boolean;
  currentPlanSlug: string | null;
  onJoin: () => void;
}) {
  const variant = plan.highlighted ? "primary" : "outline";
  const shared = { size: "sm", className: "mt-6 w-full", variant } as const;

  if (currentPlanSlug) {
    return (
      <Button {...shared} variant="outline" disabled>
        {currentPlanSlug === plan.slug ? "Your Plan" : "Already a Member"}
      </Button>
    );
  }

  if (!signedIn) {
    return (
      <Button {...shared} href={signupPath(plan)}>
        Join Now
      </Button>
    );
  }

  return (
    <Button {...shared} type="button" onClick={onJoin}>
      Join Now
    </Button>
  );
}

export function PlanGrid({
  signedIn,
  currentPlanSlug,
  selectedSlug,
}: {
  signedIn: boolean;
  currentPlanSlug: string | null;
  selectedSlug: string | null;
}) {
  const [joining, setJoining] = useState<MembershipPlan | null>(null);
  const selectedCard = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedCard.current?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {membershipPlans.map((plan) => {
          const selected = plan.slug === selectedSlug;
          const emphasised = selected || plan.highlighted;

          return (
            <div
              key={plan.slug}
              ref={selected ? selectedCard : undefined}
              className={`bg-white border rounded-sm p-6 flex flex-col transition-shadow hover:shadow-lg ${
                emphasised
                  ? "border-brand-gold ring-2 ring-brand-gold/20"
                  : "border-ink/10"
              }`}
            >
              {selected ? (
                <Badge variant="gold" className="self-start mb-3">
                  Your Selection
                </Badge>
              ) : (
                plan.highlighted && (
                  <Badge variant="gold" className="self-start mb-3">
                    Most Popular
                  </Badge>
                )
              )}
              <h3 className="text-base font-bold text-ink font-heading">
                {plan.name}
              </h3>
              <p className="mt-3 text-3xl font-black text-ink font-heading">
                {formatMoney(plan.amountMinor, plan.currency)}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {periodLabel(plan.period)}
              </p>
              <p className="mt-3 text-sm text-ink-light border-t border-ink/5 pt-3">
                {plan.eligibility}
              </p>

              <ul className="mt-4 space-y-2 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-2 text-sm text-ink-light"
                  >
                    <Check className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <PlanAction
                plan={plan}
                signedIn={signedIn}
                currentPlanSlug={currentPlanSlug}
                onJoin={() => setJoining(plan)}
              />
            </div>
          );
        })}
      </div>

      {joining && (
        <JoinDialog plan={joining} onClose={() => setJoining(null)} />
      )}
    </>
  );
}
