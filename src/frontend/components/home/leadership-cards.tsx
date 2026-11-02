"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/frontend/components/ui/container";
import { SectionHeading } from "@/frontend/components/ui/section-heading";
import { ScrollAnimate, StaggerContainer, StaggerItem } from "@/frontend/components/ui/scroll-animate";
import { leadership } from "@/frontend/content/leadership";

export function LeadershipCards() {
  return (
    <section className="bg-cream border-t border-ink/10 py-24 lg:py-32">
      <Container>
        <ScrollAnimate variant="fade-up">
          <SectionHeading
            label="Leadership"
            title="Office Bearers"
            description="Meet the leaders guiding SASS towards advancing sociological research across South Asia."
          />
        </ScrollAnimate>

        <StaggerContainer
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          staggerDelay={0.15}
        >
          {leadership.map((member) => (
            <StaggerItem key={member.name}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="group bg-white border border-ink/8 rounded-xl overflow-hidden shadow-sm hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] hover:border-brand-gold/30 transition-all duration-500 cursor-pointer"
              >
                {/* Photo */}
                <div className="relative aspect-[4/5] bg-cream-dark overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-top group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  {/* Multi-layer gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-teal/80 via-brand-dark-teal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Role badge */}
                  <div className="absolute bottom-4 left-4">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="inline-block bg-brand-gold text-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md shadow-lg"
                    >
                      {member.role}
                    </motion.span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 relative">
                  {/* Subtle top border accent */}
                  <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />

                  <h3 className="text-lg font-bold text-ink font-heading group-hover:text-brand-dark-teal transition-colors duration-300">
                    {member.name}
                  </h3>
                  {member.institution && (
                    <p className="mt-1 text-sm text-ink-muted">
                      {member.institution}
                    </p>
                  )}
                  {/* Expanding gold line */}
                  <div className="mt-3 h-0.5 w-8 bg-brand-gold/30 group-hover:w-16 group-hover:bg-brand-gold transition-all duration-500 rounded-full" />
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  );
}
