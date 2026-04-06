"use client";

import { motion } from "framer-motion";
import { Container } from "./container";

export function PageHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-brand-dark-teal relative overflow-hidden py-20 lg:py-28">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full border border-white/5" />
        <div className="absolute -bottom-1/3 -left-1/4 w-[400px] h-[400px] rounded-full bg-brand-gold/5 blur-3xl" />
      </div>

      <Container className="relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl font-heading"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-2xl text-lg text-white/70 leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}
        {/* Decorative gold line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 64 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-6 h-1 bg-brand-gold rounded-full"
        />
      </Container>
    </section>
  );
}
