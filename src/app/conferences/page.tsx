import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { upcomingEvents, previousEvents } from "@/data/events";

export const metadata: Metadata = {
  title: "SASS Conferences",
  description: "Explore past and upcoming conferences organized by the South Asian Sociological Society.",
};

export default function ConferencesPage() {
  const allEvents = [...upcomingEvents, ...previousEvents];

  return (
    <>
      <PageHero
        title="SASS Conferences"
        subtitle="International conferences bringing together sociologists and social scientists from across the globe."
      />

      <section className="py-24 lg:py-32">
        <Container>
          <div className="space-y-8">
            {allEvents.map((event) => (
              <Card key={event.id} className="p-0 overflow-hidden">
                <div className="grid gap-0 lg:grid-cols-[400px_1fr]">
                  {/* Image */}
                  <div className="relative aspect-[16/10] lg:aspect-auto bg-cream-dark">
                    <Image
                      src={event.image || "/images/hero/banner-1.png"}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant={event.status === "upcoming" ? "gold" : "teal"}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h3 className="text-xl font-black text-ink font-heading lg:text-2xl">
                      {event.title}
                    </h3>
                    <p className="mt-2 text-brand-dark-teal font-medium italic">
                      &ldquo;{event.theme}&rdquo;
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-sm text-ink-light">
                        <Calendar className="w-4 h-4 text-brand-gold-dark" />
                        {event.date}
                        {event.endDate && ` - ${event.endDate}`}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-ink-light">
                        <MapPin className="w-4 h-4 text-brand-gold-dark" />
                        {event.location}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      {event.registrationUrl && (
                        <Button href={event.registrationUrl} variant="primary" size="sm">
                          Register <ArrowRight className="w-4 h-4" />
                        </Button>
                      )}
                      {event.galleryLink && (
                        <Button href={event.galleryLink} variant="outline" size="sm">
                          View Gallery
                        </Button>
                      )}
                    </div>
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
