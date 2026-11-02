"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/frontend/components/ui/container";
import { ScrollAnimate } from "@/frontend/components/ui/scroll-animate";
import { siteConfig } from "@/shared/site-config";

const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Constitution", href: "/constitution" },
  { label: "Conferences", href: "/conferences" },
  { label: "Membership", href: "/membership" },
  { label: "Gallery", href: "/conferences/gallery" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
];

const resourceLinks = [
  { label: "Network & Publications", href: "/network-publications" },
  { label: "Student & Career", href: "/student-career" },
  { label: "Conference Guidelines", href: "/conferences/guidelines" },
  { label: "Members List", href: "/membership/members" },
];

const policyLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Cancellation & Refund Policy", href: "/refund-policy" },
  { label: "Shipping & Delivery Policy", href: "/delivery-policy" },
];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group/link flex items-center gap-1 text-sm text-white/55 hover:text-white transition-all duration-300"
    >
      <span className="group-hover/link:translate-x-1 transition-transform duration-200">
        {children}
      </span>
      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover/link:opacity-100 group-hover/link:translate-y-0 transition-all duration-200" />
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-brand-dark-teal text-white relative overflow-hidden">
      {/* Gold gradient accent line */}
      <div className="h-1 bg-gradient-to-r from-brand-gold/60 via-brand-gold to-brand-gold/60" />

      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-brand-gold/[0.03] blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-brand-teal/[0.08] blur-3xl" />
      </div>

      <Container className="py-16 relative z-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <ScrollAnimate variant="fade-up" delay={0}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/images/logo.png"
                  alt="SASS Logo"
                  width={36}
                  height={36}
                  className="w-9 h-9 brightness-200"
                />
                <span className="text-lg font-bold font-heading">SASS</span>
              </div>
              <p className="text-sm text-white/55 leading-relaxed">
                {siteConfig.tagline}. Advancing sociological research across South
                Asia since 2025.
              </p>
              {/* Social Links */}
              <div className="flex gap-4 mt-6">
                {[
                  { label: "Twitter/X", href: siteConfig.social.twitter },
                  { label: "YouTube", href: siteConfig.social.youtube },
                  { label: "LinkedIn", href: siteConfig.social.linkedin },
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2 }}
                    className="text-white/45 hover:text-brand-gold transition-colors duration-300 text-sm font-medium"
                  >
                    {social.label}
                  </motion.a>
                ))}
              </div>
            </div>
          </ScrollAnimate>

          {/* Quick Links */}
          <ScrollAnimate variant="fade-up" delay={0.1}>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold mb-5">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollAnimate>

          {/* Resources */}
          <ScrollAnimate variant="fade-up" delay={0.2}>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold mb-5">
                Resources
              </h3>
              <ul className="space-y-3">
                {resourceLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollAnimate>

          {/* Contact Info */}
          <ScrollAnimate variant="fade-up" delay={0.3}>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold mb-5">
                Contact
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-white/55 group">
                  <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-gold/20 transition-colors duration-300">
                    <MapPin className="w-4 h-4 text-brand-gold" />
                  </div>
                  <span className="group-hover:text-white/75 transition-colors duration-200">
                    {siteConfig.address}
                  </span>
                </li>
                <li className="flex gap-3 text-sm text-white/55 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-gold/20 transition-colors duration-300">
                    <Phone className="w-4 h-4 text-brand-gold" />
                  </div>
                  <a
                    href={`tel:${siteConfig.phone}`}
                    className="hover:text-white transition-colors duration-200 self-center"
                  >
                    {siteConfig.phone}
                  </a>
                </li>
                {siteConfig.emails.map((email) => (
                  <li key={email} className="flex gap-3 text-sm text-white/55 group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-gold/20 transition-colors duration-300">
                      <Mail className="w-4 h-4 text-brand-gold" />
                    </div>
                    <a
                      href={`mailto:${email}`}
                      className="hover:text-white transition-colors duration-200 break-all self-center"
                    >
                      {email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollAnimate>
        </div>
      </Container>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <Container className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/35">
            <p>
              &copy; {new Date().getFullYear()} South Asian Sociological Society.
              All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {policyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-white/60 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
