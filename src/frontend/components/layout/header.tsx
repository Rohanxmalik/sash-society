"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/frontend/components/ui/container";
import { Button } from "@/frontend/components/ui/button";
import { AuthNavLink } from "@/frontend/components/auth/auth-nav-link";
import { navigation } from "@/frontend/content/navigation";
import { MobileNav } from "./mobile-nav";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-cream/90 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] py-2.5"
            : "bg-transparent py-5"
        }`}
      >
        <Container>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <motion.div
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/images/logo.png"
                  alt="SASS Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </motion.div>
              <span className="text-lg font-bold tracking-tight text-ink font-heading hidden sm:block">
                SASS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="hidden lg:flex items-center gap-0.5"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {navigation.map((item, index) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setHoveredIndex(index)}
                >
                  <Link
                    href={item.href}
                    className="relative flex items-center gap-1 px-3 py-2 text-[13px] font-medium uppercase tracking-wider text-ink transition-colors duration-200"
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    )}
                    {/* Animated underline indicator */}
                    {hoveredIndex === index && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-gold rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {item.children && hoveredIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-0 top-full pt-2"
                      >
                        <div className="bg-white/95 backdrop-blur-xl border border-ink/8 rounded-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] min-w-[240px] py-1.5 overflow-hidden">
                          {/* Gold accent line at top */}
                          <div className="h-0.5 bg-gradient-to-r from-brand-gold via-brand-gold-dark to-brand-gold mx-3 mb-1.5 rounded-full" />
                          {item.children.map((child, childIndex) => (
                            <motion.div
                              key={child.href}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: childIndex * 0.04,
                              }}
                            >
                              <Link
                                href={child.href}
                                className="group/link flex items-center gap-3 px-4 py-2.5 text-sm text-ink-light hover:text-brand-dark-teal transition-all duration-200"
                              >
                                <span className="w-1 h-1 rounded-full bg-ink/20 group-hover/link:bg-brand-gold group-hover/link:scale-150 transition-all duration-200" />
                                {child.label}
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* CTA + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <AuthNavLink iconOnly className="hidden md:inline-flex px-2" />
              <Button
                href="/membership"
                variant="primary"
                size="sm"
                className="hidden md:inline-flex whitespace-nowrap"
              >
                Become a Member
              </Button>
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 text-ink hover:bg-ink/5 rounded-lg transition-colors duration-200 cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
