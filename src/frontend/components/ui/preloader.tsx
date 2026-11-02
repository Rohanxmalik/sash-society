"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        document.body.style.overflow = "";
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-brand-dark-teal"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full border border-white/[0.03]" />
            <div className="absolute -bottom-1/3 -left-1/4 w-[400px] h-[400px] rounded-full bg-brand-teal/10 blur-3xl" />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/images/logo.png"
                alt="SASS Logo"
                width={80}
                height={80}
                className="w-20 h-20 brightness-200 drop-shadow-2xl"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative z-10 mt-6 text-center"
          >
            <h2 className="text-2xl font-black text-white font-heading tracking-tight">
              SASS
            </h2>
            <p className="mt-1 text-sm text-white/50 uppercase tracking-[0.2em]">
              South Asian Sociological Society
            </p>
          </motion.div>

          {/* Progress bar */}
          <div className="relative z-10 mt-8 w-48">
            <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
                className="h-full bg-gradient-to-r from-brand-gold via-brand-gold-dark to-brand-gold rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
