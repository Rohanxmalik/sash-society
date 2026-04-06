"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function WordReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");

  return (
    <span className={cn("inline-flex flex-wrap", className)}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: 0.4,
            delay: delay + index * 0.08,
            ease: "easeOut",
          }}
          className="mr-[0.25em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export function LetterReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const letters = text.split("");

  return (
    <span className={cn("inline-flex", className)}>
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, filter: "blur(12px)", y: 20, scale: 1.1 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: delay + index * 0.03,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block"
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  );
}

export function GradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-brand-dark-teal via-brand-teal to-brand-light-teal bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}
