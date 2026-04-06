import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { membershipTiers } from "@/data/membership-tiers";

export const metadata: Metadata = {
  title: "Become a Member",
  description: "Join SASS - explore membership plans and become part of our academic community.",
};

export default function MembershipPage() {
  return (
    <>
      <PageHero
        title="Become a Member"
        subtitle="Join our growing community of sociologists and social scientists."
      />

      <section className="py-24 lg:py-32">
        <Container>
          <SectionHeading
            label="Membership Plans"
            title="Choose Your Plan"
            description="Select a membership category that best fits your needs. All members gain access to conferences, publications, and our academic network."
            align="center"
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {membershipTiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-white border rounded-sm p-6 flex flex-col transition-shadow hover:shadow-lg ${
                  tier.highlighted
                    ? "border-brand-gold ring-2 ring-brand-gold/20"
                    : "border-ink/10"
                }`}
              >
                {tier.highlighted && (
                  <Badge variant="gold" className="self-start mb-3">
                    Most Popular
                  </Badge>
                )}
                <h3 className="text-base font-bold text-ink font-heading">
                  {tier.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-sm text-ink-muted">
                    {tier.currency === "INR" ? "\u20B9" : "$"}
                  </span>
                  <span className="text-3xl font-black text-ink font-heading">
                    {tier.price}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  {tier.period === "one-time"
                    ? "One-time payment"
                    : tier.period === "annual"
                    ? "Per year"
                    : "4-year duration"}
                </p>
                <p className="mt-3 text-sm text-ink-light border-t border-ink/5 pt-3">
                  {tier.eligibility}
                </p>

                <ul className="mt-4 space-y-2 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-sm text-ink-light">
                      <Check className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  href="mailto:southasiansociety2@gmail.com?subject=Membership Inquiry - ${tier.name}"
                  variant={tier.highlighted ? "primary" : "outline"}
                  size="sm"
                  className="mt-6 w-full"
                >
                  Contact to Join
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-16 max-w-2xl mx-auto text-center">
            <p className="text-ink-light leading-relaxed">
              For membership inquiries, contact us at{" "}
              <a
                href="mailto:southasiansociety2@gmail.com"
                className="text-brand-dark-teal font-medium hover:underline"
              >
                southasiansociety2@gmail.com
              </a>{" "}
              or call{" "}
              <a
                href="tel:+919415688058"
                className="text-brand-dark-teal font-medium hover:underline"
              >
                +91 9415688058
              </a>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
