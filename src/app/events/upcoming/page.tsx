import type { Metadata } from "next";
import { PageHero } from "@/frontend/components/ui/page-hero";
import { Container } from "@/frontend/components/ui/container";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import { ConferenceInfo } from "@/frontend/components/events/conference-info";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { upcomingEvents } from "@/shared/events";

export const metadata: Metadata = {
  title: "Upcoming Events",
  description: "Upcoming events and conferences organized by SASS.",
};

export default function UpcomingEventsPage() {
  const event = upcomingEvents[0];

  return (
    <>
      <PageHero
        title="Upcoming Events"
        subtitle="Join us at our next international conference."
      />

      <section className="py-24 lg:py-32">
        <Container>
          {event ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="gold">Upcoming</Badge>
                <Badge variant="outline">{event.format}</Badge>
              </div>

              <h2 className="text-3xl font-black text-ink font-heading lg:text-4xl">
                {event.title}
              </h2>
              <p className="mt-4 text-xl text-brand-dark-teal font-medium italic">
                &ldquo;{event.theme}&rdquo;
              </p>

              <div className="mt-8 flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-ink-light">
                  <Calendar className="w-5 h-5 text-brand-gold-dark" />
                  {event.dateLabel ?? event.date}
                </div>
                <div className="flex items-center gap-2 text-ink-light">
                  <MapPin className="w-5 h-5 text-brand-gold-dark" />
                  {event.location}
                </div>
              </div>

              {event.details && <ConferenceInfo details={event.details} />}

              {/* CTA */}
              <div className="mt-12 flex flex-wrap gap-4">
                <Button
                  href={event.registrationUrl || "#"}
                  variant="primary"
                  size="lg"
                >
                  {event.registrationLabel ?? "Register for Conference"}
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button href="/conferences" variant="outline" size="lg">
                  View All Conferences
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-ink-light">
              No upcoming events at this time. Check back soon!
            </p>
          )}
        </Container>
      </section>
    </>
  );
}
