"use client";

import { motion } from "framer-motion";
import { Container } from "./container";
import { AnimatedCounter } from "./animated-counter";
import { siteConfig } from "@/shared/site-config";

export function StatsBar() {
  return (
    <div className="border-t border-ink/10 bg-cream py-10">
      <Container>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {siteConfig.stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="group cursor-default relative"
            >
              {/* Animated counter */}
              <p className="text-4xl font-black tracking-tight text-ink lg:text-5xl font-heading group-hover:text-brand-dark-teal transition-colors duration-300">
                <AnimatedCounter value={stat.value} duration={2.5} />
              </p>
              <p className="mt-1.5 text-sm font-medium uppercase tracking-wider text-ink-muted group-hover:text-ink-light transition-colors duration-300">
                {stat.label}
              </p>
              {/* Expanding gold accent */}
              <motion.div
                className="mt-3 h-0.5 bg-brand-gold/40 rounded-full"
                initial={{ width: 24 }}
                whileHover={{ width: 48, backgroundColor: "var(--color-brand-gold)" }}
                transition={{ duration: 0.4 }}
              />
            </motion.div>
          ))}
        </div>
      </Container>
    </div>
  );
}
