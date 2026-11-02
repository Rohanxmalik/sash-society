"use client";

import { motion } from "framer-motion";
import { Container } from "@/frontend/components/ui/container";
import { SectionHeading } from "@/frontend/components/ui/section-heading";
import { Button } from "@/frontend/components/ui/button";
import { Badge } from "@/frontend/components/ui/badge";
import { ScrollAnimate, StaggerContainer, StaggerItem } from "@/frontend/components/ui/scroll-animate";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { formatMoney } from "@/shared/money";
import { membershipPlans, periodLabel } from "@/shared/plans";

export function MembershipPreview() {
  const featured = membershipPlans.slice(0, 3);

  return (
    <section className="bg-off-white border-t border-ink/10 py-24 lg:py-32 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25px 25px, var(--color-brand-dark-teal) 1px, transparent 0)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <Container className="relative z-10">
        <ScrollAnimate variant="fade-up">
          <SectionHeading
            label="Membership"
            title="Join SASS Today"
            description="Choose a membership plan that suits your needs and become part of our growing academic community."
          />
        </ScrollAnimate>

        <StaggerContainer
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          staggerDelay={0.15}
        >
          {featured.map((tier) => (
            <StaggerItem key={tier.slug}>
              <motion.div
                whileHover={{
                  y: -8,
                  boxShadow: "0 30px 60px -15px rgba(0,0,0,0.12)",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`relative bg-white border rounded-xl p-6 flex flex-col transition-all duration-500 overflow-hidden cursor-pointer ${
                  tier.highlighted
                    ? "border-brand-gold ring-2 ring-brand-gold/20 shadow-lg"
                    : "border-ink/8 shadow-sm hover:border-brand-gold/30"
                }`}
              >
                {/* Highlight glow */}
                {tier.highlighted && (
                  <>
                    <div className="absolute -top-16 -right-16 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-brand-gold/5 rounded-full blur-3xl" />
                  </>
                )}

                <div className="relative z-10 flex flex-col flex-1">
                  {tier.highlighted && (
                    <Badge variant="gold" className="self-start mb-3">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  <h3 className="text-lg font-bold text-ink font-heading">
                    {tier.name}
                  </h3>
                  <p className="mt-3 text-3xl font-black text-ink font-heading">
                    {formatMoney(tier.amountMinor, tier.currency)}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {periodLabel(tier.period)}
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">{tier.eligibility}</p>

                  {/* Divider */}
                  <div className="my-5 h-px bg-gradient-to-r from-transparent via-ink/10 to-transparent" />

                  <ul className="space-y-3 flex-1">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex gap-2.5 text-sm text-ink-light group/feature"
                      >
                        <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-brand-teal/10 flex items-center justify-center group-hover/feature:bg-brand-teal/20 transition-colors duration-200">
                          <Check className="w-3 h-3 text-brand-teal" />
                        </div>
                        <span className="group-hover/feature:text-ink transition-colors duration-200">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    href="/membership"
                    variant={tier.highlighted ? "primary" : "outline"}
                    size="sm"
                    className="mt-6 w-full"
                  >
                    Learn More
                  </Button>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollAnimate variant="fade-up" delay={0.3}>
          <div className="mt-8 text-center">
            <Button href="/membership" variant="ghost">
              View All Membership Plans
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </ScrollAnimate>
      </Container>
    </section>
  );
}
