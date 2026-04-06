import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { conferenceChronology } from "@/data/conferences";

export const metadata: Metadata = {
  title: "Chronology of SASS",
  description: "Timeline of all SASS conferences from inception to present.",
};

export default function ChronologyPage() {
  return (
    <>
      <PageHero
        title="Chronology of SASS"
        subtitle="A timeline of all South Asian Sociological Society conferences."
      />

      <section className="py-24 lg:py-32">
        <Container>
          <div className="max-w-3xl mx-auto">
            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-brand-gold/30" />

              {conferenceChronology.map((conf, i) => (
                <div key={conf.number} className="relative flex gap-8 pb-12 last:pb-0">
                  {/* Circle */}
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-brand-dark-teal text-white font-black font-heading text-xl shrink-0 border-4 border-cream">
                    {conf.number}
                  </div>

                  {/* Content */}
                  <div className="bg-white border border-ink/10 rounded-sm p-6 flex-1 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-black text-brand-gold-dark font-heading">
                        {conf.year}
                      </span>
                      <span className="text-sm text-ink-muted">|</span>
                      <span className="text-sm font-medium text-ink-light">
                        {conf.venue}
                      </span>
                    </div>
                    <p className="text-ink-light italic">
                      &ldquo;{conf.theme}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
