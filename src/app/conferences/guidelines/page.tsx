import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Building2, Users, CreditCard, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Conference Guidelines",
  description: "Guidelines for hosting and organizing SASS conferences.",
};

export default function ConferenceGuidelinesPage() {
  return (
    <>
      <PageHero
        title="Conference Guidelines"
        subtitle="Requirements and guidelines for hosting the South Asian Conference (SAC)."
      />

      <section className="py-24 lg:py-32">
        <Container>
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Section A */}
            <div>
              <h2 className="text-2xl font-black text-ink font-heading border-b border-ink/10 pb-4 mb-8">
                A. Requirements for Hosting the SAC
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <Card className="p-6">
                  <Building2 className="w-8 h-8 text-brand-teal mb-3" />
                  <h3 className="font-bold text-ink mb-2">Eligibility</h3>
                  <p className="text-sm text-ink-light leading-relaxed">
                    Vice Chancellors, Directors, Heads of Institutions, Regional
                    Associations, or collaborating institutions may apply. Written
                    financial and infrastructure assurances are required.
                  </p>
                </Card>

                <Card className="p-6">
                  <Users className="w-8 h-8 text-brand-teal mb-3" />
                  <h3 className="font-bold text-ink mb-2">Conference Specs</h3>
                  <p className="text-sm text-ink-light leading-relaxed">
                    Duration: 4 days. Expected attendance: 1,500+ delegates.
                    Young Researcher&apos;s Workshop: 1-2 days preceding the main
                    conference.
                  </p>
                </Card>

                <Card className="p-6">
                  <Building2 className="w-8 h-8 text-brand-teal mb-3" />
                  <h3 className="font-bold text-ink mb-2">Infrastructure</h3>
                  <p className="text-sm text-ink-light leading-relaxed">
                    Large auditorium for plenaries, 28 concurrent meeting rooms
                    with presentation equipment, dedicated space for management
                    committee meetings, and SASS office operations area.
                  </p>
                </Card>

                <Card className="p-6">
                  <Users className="w-8 h-8 text-brand-teal mb-3" />
                  <h3 className="font-bold text-ink mb-2">Accommodation</h3>
                  <p className="text-sm text-ink-light leading-relaxed">
                    Discounted lodging and meals from Day 1 dinner through Day 4
                    lunch. Sociology or South Asian Studies department presence
                    preferred.
                  </p>
                </Card>
              </div>
            </div>

            {/* Section B */}
            <div>
              <h2 className="text-2xl font-black text-ink font-heading border-b border-ink/10 pb-4 mb-8">
                B. Organizing Guidelines
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <Card className="p-6">
                  <CreditCard className="w-8 h-8 text-brand-teal mb-3" />
                  <h3 className="font-bold text-ink mb-2">Financial</h3>
                  <p className="text-sm text-ink-light leading-relaxed">
                    Online registration system mandatory. SASS retains 20% of
                    registration fees. Host institution receives 50% of surplus
                    revenue (remainder to SASS).
                  </p>
                </Card>

                <Card className="p-6">
                  <FileText className="w-8 h-8 text-brand-teal mb-3" />
                  <h3 className="font-bold text-ink mb-2">Academic</h3>
                  <p className="text-sm text-ink-light leading-relaxed">
                    Conference theme and academic leadership directed by the SASS
                    President. Certificates, abstracts, and documentation follow
                    SASS standards.
                  </p>
                </Card>
              </div>

              <div className="mt-8 p-6 bg-cream-dark rounded-sm">
                <p className="text-sm text-ink-muted italic">
                  This document should be periodically reviewed by the SASS
                  Managing Committee. Continuous coordination with SASS Office
                  Bearers is mandatory throughout the conference planning process.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
