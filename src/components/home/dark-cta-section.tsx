"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ScrollAnimate } from "@/components/ui/scroll-animate";
import { ArrowRight } from "lucide-react";

export function DarkCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax effect for the watermark text
  const watermarkY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const watermarkOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      className="bg-brand-dark-teal relative overflow-hidden py-24 md:py-32"
    >
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            background: [
              "radial-gradient(ellipse at 20% 50%, rgba(27,111,130,0.3) 0%, transparent 60%)",
              "radial-gradient(ellipse at 80% 50%, rgba(27,111,130,0.3) 0%, transparent 60%)",
              "radial-gradient(ellipse at 20% 50%, rgba(27,111,130,0.3) 0%, transparent 60%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        />
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-brand-gold/[0.04] blur-3xl"
        />
      </div>

      {/* Large parallax watermark text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <motion.span
          style={{ y: watermarkY, opacity: watermarkOpacity }}
          className="text-[20rem] font-black text-white/[0.03] font-heading leading-none hidden md:block"
        >
          SASS
        </motion.span>
      </div>

      <Container className="relative z-10">
        <ScrollAnimate variant="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-gold mb-6 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-brand-gold" />
            Join Our Community
          </p>
        </ScrollAnimate>

        <div className="grid gap-8 lg:grid-cols-2 items-end">
          <ScrollAnimate variant="fade-right" delay={0.1}>
            <div>
              <h2 className="text-4xl font-black text-white md:text-5xl lg:text-6xl font-heading leading-tight">
                Become part of
                <br />
                a growing network
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
                  className="text-brand-gold"
                >
                  .
                </motion.span>
              </h2>
            </div>
          </ScrollAnimate>

          <ScrollAnimate variant="fade-left" delay={0.2}>
            <div>
              <p className="text-lg text-white/55 leading-relaxed mb-8">
                Join sociologists and social scientists from across South Asia and
                beyond. Access conferences, journals, workshops, and a vibrant
                academic community committed to advancing sociological knowledge.
              </p>
              <Button href="/membership" variant="primary" size="lg">
                Become a Member
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </ScrollAnimate>
        </div>
      </Container>
    </section>
  );
}
