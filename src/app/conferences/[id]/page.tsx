import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { loadGallery } from "@/backend/gallery";
import { ConferenceBrochureView } from "@/frontend/components/events/conference-brochure";
import {
  ConferenceInfo,
  Section,
} from "@/frontend/components/events/conference-info";
import { SavePdfButton } from "@/frontend/components/events/save-pdf-button";
import { GalleryGrid } from "@/frontend/components/gallery/gallery-grid";
import { Button } from "@/frontend/components/ui/button";
import { Container } from "@/frontend/components/ui/container";
import { PageHero } from "@/frontend/components/ui/page-hero";
import { findEvent, previousEvents, upcomingEvents } from "@/shared/events";

type Params = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return [...upcomingEvents, ...previousEvents].map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const event = findEvent((await params).id);
  return event ? { title: event.title, description: event.theme } : {};
}

export default async function ConferencePage({ params }: Params) {
  const event = findEvent((await params).id);
  if (!event) notFound();

  const gallery = event.photos
    ? await loadGallery(
        [{ id: event.id, label: event.title, folder: event.photos }],
        path.join(process.cwd(), "public")
      )
    : [];

  return (
    <>
      <PageHero title={event.title} subtitle={event.theme} />

      <section className="py-16 lg:py-24">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-6 text-ink-light">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-gold-dark" />
                  {event.dateLabel ?? event.date}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-gold-dark" />
                  {event.location}
                </div>
              </div>
              <div className="no-print flex flex-wrap gap-3">
                <SavePdfButton />
                {event.registrationUrl && (
                  <Button href={event.registrationUrl} variant="primary" size="sm">
                    {event.registrationLabel ?? "Register"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {event.details && <ConferenceInfo details={event.details} />}
            {event.brochure && <ConferenceBrochureView brochure={event.brochure} />}

            {gallery.length > 0 && (
              <div className="no-print">
                <Section title="Photographs">
                  <GalleryGrid conferences={gallery} showFilters={false} />
                </Section>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
