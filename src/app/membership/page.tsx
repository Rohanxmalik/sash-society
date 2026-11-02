import type { Metadata } from "next";
import { getSession } from "@/backend/auth/session";
import { getDb } from "@/backend/db";
import { findLiveMembership } from "@/backend/members/repository";
import { displayStatus } from "@/backend/members/rules";
import { PlanGrid } from "@/frontend/components/membership/plan-grid";
import { Container } from "@/frontend/components/ui/container";
import { PageHero } from "@/frontend/components/ui/page-hero";
import { SectionHeading } from "@/frontend/components/ui/section-heading";
import { siteConfig } from "@/shared/site-config";

export const metadata: Metadata = {
  title: "Become a Member",
  description:
    "Join SASS - explore membership plans and become part of our academic community.",
};

async function currentPlanFor(userId: string) {
  const live = await findLiveMembership(getDb(), userId);
  if (!live || displayStatus(live, new Date()) === "expired") return null;
  return live.planSlug;
}

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[] }>;
}) {
  const { plan } = await searchParams;
  const session = await getSession();
  const currentPlanSlug = session ? await currentPlanFor(session.user.id) : null;

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

          <PlanGrid
            signedIn={Boolean(session)}
            currentPlanSlug={currentPlanSlug}
            selectedSlug={typeof plan === "string" ? plan : null}
          />

          <div className="mt-16 max-w-2xl mx-auto text-center">
            <p className="text-ink-light leading-relaxed">
              For membership inquiries, contact us at{" "}
              <a
                href={`mailto:${siteConfig.emails[0]}`}
                className="text-brand-dark-teal font-medium hover:underline"
              >
                {siteConfig.emails[0]}
              </a>{" "}
              or call{" "}
              <a
                href={`tel:${siteConfig.phone.replaceAll(" ", "")}`}
                className="text-brand-dark-teal font-medium hover:underline"
              >
                {siteConfig.phone}
              </a>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
