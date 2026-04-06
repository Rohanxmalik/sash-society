"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollAnimate } from "@/components/ui/scroll-animate";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { upcomingEvents } from "@/data/events";

export function FeaturedConference() {
  const event = upcomingEvents[0];
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  if (!event) return null;

  return (
    <section ref={sectionRef} className="bg-cream py-24 lg:py-32">
      <Container>
        <ScrollAnimate variant="fade-up">
          <SectionHeading
            label="Featured Event"
            title="Upcoming Conference"
          />
        </ScrollAnimate>

        <div className="grid gap-8 lg:grid-cols-2 items-center">
          {/* Image with parallax */}
          <ScrollAnimate variant="fade-right" delay={0.1}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative aspect-[4/3] bg-brand-dark-teal/10 rounded-xl overflow-hidden shadow-lg group cursor-pointer"
            >
              <motion.div style={{ y: imageY }} className="absolute inset-[-30px]">
                <Image
                  src={event.image || "/images/hero/banner-1.png"}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </motion.div>
              {/* Shimmer overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-dark-teal/30 via-transparent to-brand-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 left-4">
                <Badge variant="gold">Upcoming</Badge>
              </div>
            </motion.div>
          </ScrollAnimate>

          {/* Details */}
          <ScrollAnimate variant="fade-left" delay={0.2}>
            <div>
              <Badge variant="teal" className="mb-4">
                {event.format}
              </Badge>
              <h3 className="text-2xl font-black text-ink lg:text-3xl font-heading">
                {event.title}
              </h3>
              <p className="mt-3 text-brand-dark-teal font-semibold italic">
                &ldquo;{event.theme}&rdquo;
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-ink-light group/item hover:text-ink transition-colors duration-200 cursor-default">
                  <div className="w-9 h-9 rounded-lg bg-brand-gold/10 flex items-center justify-center group-hover/item:bg-brand-gold/20 transition-colors duration-200">
                    <Calendar className="w-4 h-4 text-brand-gold-dark" />
                  </div>
                  <span>March 8-13, 2026</span>
                </div>
                <div className="flex items-center gap-3 text-ink-light group/item hover:text-ink transition-colors duration-200 cursor-default">
                  <div className="w-9 h-9 rounded-lg bg-brand-gold/10 flex items-center justify-center group-hover/item:bg-brand-gold/20 transition-colors duration-200">
                    <MapPin className="w-4 h-4 text-brand-gold-dark" />
                  </div>
                  <span>{event.location}</span>
                </div>
              </div>

              {/* Key Topics */}
              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted mb-3">
                  Key Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Social Change",
                    "Education & Policy",
                    "Gender & Equity",
                    "Technology & Ethics",
                    "Sustainability",
                    "Migration & Identity",
                  ].map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border border-ink/12 text-ink-light hover:bg-brand-dark-teal hover:text-white hover:border-brand-dark-teal transition-all duration-300 cursor-default"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button href={event.registrationUrl || "#"} variant="primary">
                  Register Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button href="/events/upcoming" variant="ghost">
                  View Details
                </Button>
              </div>
            </div>
          </ScrollAnimate>
        </div>
      </Container>
    </section>
  );
}
