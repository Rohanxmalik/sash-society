"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navigation } from "@/frontend/content/navigation";
import { Button } from "@/frontend/components/ui/button";
import { AuthNavLink } from "@/frontend/components/auth/auth-nav-link";

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-cream shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-ink/10">
              <span className="text-lg font-bold font-heading text-ink">
                Menu
              </span>
              <button
                onClick={onClose}
                className="p-2 text-ink hover:bg-ink/5 rounded-lg cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 overflow-y-auto h-[calc(100%-80px)]">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-ink/5"
                >
                  {item.children ? (
                    <>
                      <button
                        onClick={() =>
                          setExpanded(
                            expanded === item.label ? null : item.label
                          )
                        }
                        className="flex items-center justify-between w-full px-3 py-3.5 text-sm font-semibold uppercase tracking-wider text-ink cursor-pointer"
                      >
                        {item.label}
                        <motion.div
                          animate={{
                            rotate: expanded === item.label ? 180 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {expanded === item.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pb-2 pl-3">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={onClose}
                                  className="block px-3 py-2 text-sm text-ink-light hover:text-brand-dark-teal hover:pl-4 transition-all duration-200"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block px-3 py-3.5 text-sm font-semibold uppercase tracking-wider text-ink"
                    >
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 px-3"
              >
                <Button href="/membership" variant="primary" className="w-full">
                  Become a Member
                </Button>
                <div onClick={onClose} className="mt-3">
                  <AuthNavLink className="w-full" />
                </div>
              </motion.div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
