"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Card({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  if (!hover) {
    return (
      <div
        className={cn(
          "bg-white border border-ink/8 rounded-lg p-6 shadow-sm",
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "bg-white border border-ink/8 rounded-lg p-6 shadow-sm transition-colors hover:border-brand-gold/30",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
