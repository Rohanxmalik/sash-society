"use client";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { StatsBar } from "@/components/ui/stats-bar";
import { LetterReveal } from "@/components/ui/animated-text";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function HeroBanner() {
  return (
    <>
      <section className="relative min-h-screen flex flex-col justify-center bg-cream overflow-hidden pt-20">
        {/* Decorative grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-y-0 left-[10%] w-px bg-ink/[0.04]" />
          <div className="absolute inset-y-0 left-[30%] w-px bg-ink/[0.04]" />
          <div className="absolute inset-y-0 right-[10%] w-px bg-ink/[0.04]" />
          <div className="absolute inset-y-0 right-[30%] w-px bg-ink/[0.04]" />
          {/* Animated gradient line */}
          <motion.div
            className="absolute inset-y-0 left-[10%] w-px"
            style={{
              background: "linear-gradient(to bottom, transparent, var(--color-brand-gold), transparent)",
            }}
            animate={{ top: ["-100%", "100%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Subtle animated circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full border border-brand-gold/[0.06]"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/3 -left-1/4 w-[600px] h-[600px] rounded-full border border-brand-teal/[0.06]"
          />
        </div>

        <Container className="relative z-10">
          {/* Label */}
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-gold-dark mb-6 flex items-center gap-3"
          >
            <motion.span
              className="inline-block w-8 h-px bg-brand-gold-dark"
              initial={{ width: 0 }}
              animate={{ width: 32 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
            South Asian Sociological Society
          </motion.p>

          {/* Giant Heading with letter-by-letter blur reveal */}
          <h1 className="text-5xl font-black tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-heading leading-[0.9]">
            <LetterReveal text="ADVANCING" delay={0.4} />
            <br />
            <LetterReveal text="SOCIOLOGICAL" delay={0.7} />
            <br />
            <span className="inline-flex">
              <LetterReveal text="RESEARCH" delay={1.0} />
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.35, type: "spring", stiffness: 300 }}
                className="text-brand-gold"
              >
                .
              </motion.span>
            </span>
          </h1>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.4 }}
            className="mt-8 max-w-xl"
          >
            <p className="text-lg text-ink-light leading-relaxed">
              We enhance research collaboration through meaningful academic
              exchange, conferences, workshops, and scholarly publications —
              fostering capacity building and global sociological dialogue.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.7 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Button href="/events/upcoming" variant="primary" size="lg">
              Singapore 2026 Conference
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button href="/about" variant="outline" size="lg">
              Learn More
            </Button>
          </motion.div>
        </Container>

        {/* Stats Bar at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="mt-auto"
        >
          <StatsBar />
        </motion.div>
      </section>
    </>
  );
}
