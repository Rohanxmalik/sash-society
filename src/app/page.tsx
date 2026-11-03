import { HeroBanner } from "@/frontend/components/home/hero-banner";
import { QuickLinks } from "@/frontend/components/home/quick-links";
import { FeaturedConference } from "@/frontend/components/home/featured-conference";
import { DarkCtaSection } from "@/frontend/components/home/dark-cta-section";
import { LeadershipCards } from "@/frontend/components/home/leadership-cards";
import { MembershipPreview } from "@/frontend/components/home/membership-preview";

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <QuickLinks />
      <FeaturedConference />
      <DarkCtaSection />
      <LeadershipCards />
      <MembershipPreview />
    </>
  );
}
