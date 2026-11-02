import type { Metadata } from "next";
import { PageHero } from "@/frontend/components/ui/page-hero";
import { Container } from "@/frontend/components/ui/container";
import { Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Achievement Awards",
  description: "SASS Achievement Awards recognizing outstanding contributions to sociology.",
};

export default function AchievementAwardsPage() {
  return (
    <>
      <PageHero
        title="Achievement Awards"
        subtitle="Recognizing outstanding contributions to sociological research and practice."
      />

      <section className="py-24 lg:py-32">
        <Container>
          <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-brand-gold/20 flex items-center justify-center mb-6">
              <Award className="w-10 h-10 text-brand-gold-dark" />
            </div>
            <h2 className="text-3xl font-black text-ink font-heading">
              Coming Soon
            </h2>
            <p className="mt-4 text-ink-light leading-relaxed">
              The SASS Achievement Awards program is currently being developed.
              Stay tuned for announcements about nominations, categories, and
              award ceremonies recognizing outstanding contributions to
              sociological research and practice in South Asia.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
