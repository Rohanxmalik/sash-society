import { HeroBanner } from "@/components/home/hero-banner";
import { FeaturedConference } from "@/components/home/featured-conference";
import { DarkCtaSection } from "@/components/home/dark-cta-section";
import { LeadershipCards } from "@/components/home/leadership-cards";
import { MembershipPreview } from "@/components/home/membership-preview";

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <FeaturedConference />
      <DarkCtaSection />
      <LeadershipCards />
      <MembershipPreview />
    </>
  );
}
