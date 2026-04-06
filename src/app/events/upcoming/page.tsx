import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { upcomingEvents } from "@/data/events";

export const metadata: Metadata = {
  title: "Upcoming Events",
  description: "Upcoming events and conferences organized by SASS.",
};

const topics = [
  "Social Change and Development",
  "Education, Policy, and Governance",
  "Gender, Equity, and Social Justice",
  "Globalization and Cultural Dynamics",
  "Technology, Society, and Ethics",
  "Sustainability and Inclusive Development",
  "Migration, Identity, and Human Rights",
];

const participants = [
  "Faculty and academicians",
  "Research scholars and students",
  "Policy-makers and administrators",
  "NGO and international organization representatives",
];

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
                  March 8-13, 2026
                </div>
                <div className="flex items-center gap-2 text-ink-light">
                  <MapPin className="w-5 h-5 text-brand-gold-dark" />
                  {event.location}
                </div>
              </div>

              {/* Key Topics */}
              <div className="mt-12">
                <h3 className="text-xl font-black text-ink font-heading mb-6">
                  Key Topics
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {topics.map((topic) => (
                    <Card key={topic} className="p-4">
                      <p className="text-sm font-medium text-ink">{topic}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Target Participants */}
              <div className="mt-12">
                <h3 className="text-xl font-black text-ink font-heading mb-6">
                  Who Should Attend
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {participants.map((p) => (
                    <div key={p} className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-brand-teal" />
                      <span className="text-sm text-ink-light">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-12 flex flex-wrap gap-4">
                <Button
                  href={event.registrationUrl || "#"}
                  variant="primary"
                  size="lg"
                >
                  Register for Conference
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
