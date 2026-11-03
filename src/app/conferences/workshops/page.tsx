import type { Metadata } from "next";
import { PageHero } from "@/frontend/components/ui/page-hero";
import { Container } from "@/frontend/components/ui/container";
import { BookOpen } from "lucide-react";
import { siteConfig } from "@/shared/site-config";

export const metadata: Metadata = {
  title: "Young Research Scholars Workshop",
  description: "SASS workshops for young research scholars.",
};

export default function WorkshopsPage() {
  return (
    <>
      <PageHero
        title="Young Research Scholars Workshop"
        subtitle="Capacity building workshops for emerging sociological researchers."
      />

      <section className="py-24 lg:py-32">
        <Container>
          <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-brand-gold/20 flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-brand-gold-dark" />
            </div>
            <h2 className="text-3xl font-black text-ink font-heading">
              Content Coming Soon
            </h2>
            <p className="mt-4 text-ink-light leading-relaxed">
              Details about the Young Research Scholars Workshop will be updated
              soon. These workshops are typically held 1-2 days before the main
              SASS conference and are designed to build research capacity among
              emerging scholars in sociology and social sciences.
            </p>
            <p className="mt-4 text-sm text-ink-muted">
              For inquiries, contact{" "}
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-brand-dark-teal hover:underline"
              >
                {siteConfig.email}
              </a>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
