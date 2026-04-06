import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { ContactForm } from "@/components/contact/contact-form";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the South Asian Sociological Society.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="Get in touch with SASS for membership inquiries, conference information, or general questions."
      />

      <section className="py-24 lg:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
            {/* Form */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold-dark mb-2">
                Send us a message
              </h2>
              <h3 className="text-2xl font-black text-ink font-heading mb-8">
                Get In Touch
              </h3>
              <ContactForm />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold-dark mb-4">
                  Contact Information
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 text-sm text-ink-light">
                    <MapPin className="w-5 h-5 shrink-0 text-brand-teal" />
                    <span>{siteConfig.address}</span>
                  </li>
                  <li className="flex gap-3 text-sm text-ink-light">
                    <Phone className="w-5 h-5 shrink-0 text-brand-teal" />
                    <a href={`tel:${siteConfig.phone}`} className="hover:text-brand-dark-teal">
                      {siteConfig.phone}
                    </a>
                  </li>
                  {siteConfig.emails.map((email) => (
                    <li key={email} className="flex gap-3 text-sm text-ink-light">
                      <Mail className="w-5 h-5 shrink-0 text-brand-teal" />
                      <a href={`mailto:${email}`} className="hover:text-brand-dark-teal break-all">
                        {email}
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold-dark mb-4">
                  Department Contacts
                </h3>
                <ul className="space-y-3">
                  {["Membership", "Conference & Events", "Publications & Journal"].map(
                    (dept) => (
                      <li key={dept}>
                        <p className="text-sm font-medium text-ink">{dept}</p>
                        <a
                          href="mailto:southasiansociety2@gmail.com"
                          className="text-xs text-ink-muted hover:text-brand-dark-teal"
                        >
                          southasiansociety2@gmail.com
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </Card>

              <Card className="p-6 bg-brand-dark-teal text-white border-none">
                <Clock className="w-6 h-6 text-brand-gold mb-3" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold mb-2">
                  Connect With Us
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Follow SASS on social media for the latest updates on
                  conferences, publications, and academic opportunities.
                </p>
                <div className="flex gap-4 mt-4">
                  <a href={siteConfig.social.twitter} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-brand-gold text-sm transition-colors">
                    Twitter/X
                  </a>
                  <a href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-brand-gold text-sm transition-colors">
                    YouTube
                  </a>
                  <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-brand-gold text-sm transition-colors">
                    LinkedIn
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
