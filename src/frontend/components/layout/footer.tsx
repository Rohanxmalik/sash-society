"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/frontend/components/ui/container";
import { ScrollAnimate } from "@/frontend/components/ui/scroll-animate";
import { SocialIcon, type SocialNetwork } from "@/frontend/components/ui/social-icon";
import { siteConfig } from "@/shared/site-config";
import { VisitorCounter } from "./visitor-counter";

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

const NO_PROFILE_YET = "#";

const socialLinks: { label: string; href: string; network: SocialNetwork }[] = [
  { label: "X", href: siteConfig.social.twitter, network: "x" },
  { label: "Instagram", href: siteConfig.social.instagram, network: "instagram" },
  { label: "Facebook", href: siteConfig.social.facebook, network: "facebook" },
  { label: "LinkedIn", href: siteConfig.social.linkedin, network: "linkedin" },
  { label: "YouTube", href: siteConfig.social.youtube, network: "youtube" },
];

function SocialLink({
  label,
  href,
  network,
}: {
  label: string;
  href: string;
  network: SocialNetwork;
}) {
  const hasProfile = href !== NO_PROFILE_YET;

  return (
    <motion.a
      href={href}
      aria-label={label}
      target={hasProfile ? "_blank" : undefined}
      rel={hasProfile ? "noopener noreferrer" : undefined}
      onClick={hasProfile ? undefined : (event) => event.preventDefault()}
      whileHover={{ y: -2 }}
      className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/55 hover:text-brand-gold hover:bg-white/10 transition-colors duration-300"
    >
      <SocialIcon network={network} className="w-4 h-4" />
    </motion.a>
  );
}

function CreditLink() {
  return (
    <motion.a
      href={siteConfig.credit.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -2 }}
      className="group/credit inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-brand-gold/25 bg-white/5 px-4 py-2 text-xs text-white/55 hover:border-brand-gold/60 hover:bg-white/10 transition-colors duration-300"
    >
      <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
      <span>
        Designed and developed by{" "}
        <span className="credit-shimmer font-semibold">
          {siteConfig.credit.name}
        </span>
      </span>
      <ArrowUpRight className="w-3.5 h-3.5 text-brand-gold transition-transform duration-200 group-hover/credit:translate-x-0.5 group-hover/credit:-translate-y-0.5" />
    </motion.a>
  );
}

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
              <div className="flex gap-3 mt-6">
                {socialLinks.map((social) => (
                  <SocialLink key={social.label} {...social} />
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
                <li className="flex gap-3 text-sm text-white/55 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-gold/20 transition-colors duration-300">
                    <Mail className="w-4 h-4 text-brand-gold" />
                  </div>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="hover:text-white transition-colors duration-200 break-all self-center"
                  >
                    {siteConfig.email}
                  </a>
                </li>
              </ul>
            </div>
          </ScrollAnimate>
        </div>
      </Container>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <Container className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="text-xs text-white/35 text-center md:text-left">
              <p>
                &copy; {new Date().getFullYear()} South Asian Sociological Society.
                All rights reserved.
              </p>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
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
            <div className="flex flex-col items-center gap-2 md:items-end">
              <VisitorCounter />
              <CreditLink />
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
