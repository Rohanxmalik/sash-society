import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { networks } from "@/data/networks";

export const metadata: Metadata = {
  title: "Network & Publications",
  description: "Research publication platforms and networks curated by SASS.",
};

export default function NetworkPublicationsPage() {
  return (
    <>
      <PageHero
        title="Network & Publications"
        subtitle="A curated collection of global research publication platforms for sociology and social science scholars."
      />

      <section className="py-24 lg:py-32">
        <Container>
          <SectionHeading
            label="Research Platforms"
            title="Publication Networks"
            description="Explore these platforms to share and discover sociological research from around the world."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {networks.map((network) => (
              <Card key={network.name} className="p-6 flex flex-col">
                <h3 className="text-lg font-bold text-ink font-heading">
                  {network.name}
                </h3>
                <p className="mt-2 text-sm text-ink-light leading-relaxed flex-1">
                  {network.description}
                </p>
                <a
                  href={network.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-dark-teal hover:text-brand-teal transition-colors"
                >
                  Visit Platform
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
