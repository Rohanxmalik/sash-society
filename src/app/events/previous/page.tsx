import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/frontend/components/ui/page-hero";
import { Container } from "@/frontend/components/ui/container";
import { Card } from "@/frontend/components/ui/card";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import { previousEvents } from "@/shared/events";

export const metadata: Metadata = {
  title: "Previous Events",
  description: "Past events and conferences organized by SASS.",
};

export default function PreviousEventsPage() {
  return (
    <>
      <PageHero
        title="Previous Events"
        subtitle="A look back at our completed conferences and events."
      />

      <section className="py-24 lg:py-32">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            {previousEvents.map((event) => (
              <Card key={event.id} className="p-0 overflow-hidden">
                <div className="relative aspect-[16/10] bg-cream-dark">
                  <Image
                    src={event.image || "/images/hero/banner-1.png"}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="teal">Completed</Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-ink font-heading">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-sm text-brand-dark-teal italic">
                    &ldquo;{event.theme}&rdquo;
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-xs text-ink-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      {event.dateLabel ?? event.date}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ink-muted">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button href={`/conferences/${event.id}`} variant="secondary" size="sm">
                      View Brochure
                    </Button>
                    {event.galleryLink && (
                      <Button href={event.galleryLink} variant="outline" size="sm">
                        View Gallery
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
