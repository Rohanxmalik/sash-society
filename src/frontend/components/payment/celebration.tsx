"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { PaymentOutcome } from "@/shared/checkout";

const DISPLAY_MS = 6500;
const REDUCED_DISPLAY_MS = 3500;
const PARTICLE_COUNT = 44;
const RING_COUNT = 3;

const MESSAGES: Record<PaymentOutcome, { title: string; subtitle: string }> = {
  active: {
    title: "Welcome to SASS Society",
    subtitle:
      "Your membership is active. Your certificate is on its way to your inbox.",
  },
  pending_approval: {
    title: "Application Received",
    subtitle:
      "Thank you. The committee will review your application and we will email you the outcome.",
  },
  registered: {
    title: "You Are Registered",
    subtitle:
      "We look forward to seeing you. Your confirmation and receipt are on their way to your inbox.",
  },
};

// Spread evenly around a circle, with distances and sizes that look scattered.
const particles = Array.from({ length: PARTICLE_COUNT }, (_, index) => {
  const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
  const distance = 220 + ((index * 37) % 340);
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    size: 4 + (index % 5) * 2,
    delay: 0.9 + (index % 7) * 0.05,
    rounded: index % 3 !== 0,
  };
});

function Burst() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {Array.from({ length: RING_COUNT }, (_, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full border border-brand-gold/40 w-40 h-40"
          initial={{ scale: 0, opacity: 0.9 }}
          animate={{ scale: 7, opacity: 0 }}
          transition={{ duration: 2.4, delay: 0.7 + index * 0.35, ease: "easeOut" }}
        />
      ))}
      {particles.map(({ x, y, size, delay, rounded }, index) => (
        <motion.span
          key={index}
          className={`absolute bg-brand-gold ${rounded ? "rounded-full" : ""}`}
          style={{ width: size, height: size }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{
            x,
            y,
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0.4],
            rotate: rounded ? 0 : 280,
          }}
          transition={{ duration: 2.6, delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function Celebration({ outcome }: { outcome: PaymentOutcome }) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { title, subtitle } = MESSAGES[outcome];

  useEffect(() => {
    const timer = setTimeout(
      () => {
        router.replace("/");
        router.refresh();
      },
      reducedMotion ? REDUCED_DISPLAY_MS : DISPLAY_MS
    );
    return () => clearTimeout(timer);
  }, [reducedMotion, router]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-brand-dark-teal px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {!reducedMotion && <Burst />}

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255, 205, 5, 0.22), transparent 62%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.5] }}
        transition={{ duration: 2.5, delay: 0.4 }}
      />

      <div className="relative z-10 max-w-3xl">
        <motion.div
          className="mx-auto mb-8 w-28 h-28 rounded-full bg-white/95 flex items-center justify-center shadow-[0_0_80px_rgba(255,205,5,0.55)]"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 13, delay: 0.3 }}
        >
          <Image src="/images/logo.png" alt="" width={76} height={76} />
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-6xl font-black tracking-tight text-white font-heading"
          initial={{ opacity: 0, y: 40, letterSpacing: "0.3em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "-0.02em" }}
          transition={{ duration: 1.1, delay: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {title}
        </motion.h1>

        <motion.div
          className="mx-auto mt-6 h-1 rounded-full bg-brand-gold"
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ duration: 0.8, delay: 1.9, ease: "easeOut" }}
        />

        <motion.p
          className="mt-6 text-lg text-white/80 leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.2 }}
        >
          {subtitle}
        </motion.p>
      </div>
    </motion.div>
  );
}
