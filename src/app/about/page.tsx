import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { BookOpen, Users, Globe, GraduationCap, Newspaper, Mic } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about the South Asian Sociological Society - a regional scholarly platform advancing scientific and sociological knowledge across South Asia.",
};

const activities = [
  {
    icon: Newspaper,
    title: "Publications",
    description:
      "Biannual Journal of SASS, E-Journals and Newsletters published regularly.",
  },
  {
    icon: Mic,
    title: "Academic Conferences",
    description:
      "International conferences bringing together sociologists from across the globe.",
  },
  {
    icon: BookOpen,
    title: "Research Support",
    description:
      "Research committee support and facilitation of international research initiatives.",
  },
  {
    icon: GraduationCap,
    title: "Memorial Lectures",
    description:
      "Memorial and thematic lectures honoring distinguished sociologists.",
  },
  {
    icon: Users,
    title: "Workshops",
    description:
      "Young Research Scholars Workshops and training programs for capacity building.",
  },
  {
    icon: Globe,
    title: "International Cooperation",
    description:
      "Fostering connections between sociologists and social scientists across South Asia.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About SASS"
        subtitle="A regional scholarly platform advancing scientific and sociological knowledge across South Asia."
      />

      <section className="py-24 lg:py-32">
        <Container>
          {/* Mission & Vision Bento Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Mission */}
            <Card className="lg:col-span-2 p-8 lg:p-12">
              <SectionHeading label="Our Mission" title="Who We Are" />
              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <p className="text-lg text-ink-light leading-relaxed">
                    The South Asian Sociological Society (SASS) is a regional
                    scholarly platform formally established in January 2025 in
                    Chhatrapati Sambhajinagar, Maharashtra, India.
                  </p>
                  <p className="mt-4 text-lg text-ink-light leading-relaxed">
                    SASS is committed to advancing scientific and sociological
                    knowledge across South Asia. As a non-profit professional
                    association, we represent academicians and sociologists
                    globally, irrespective of their methodological approaches or
                    theoretical perspectives.
                  </p>
                </div>
                <div>
                  <p className="text-lg text-ink-light leading-relaxed">
                    The Society aims to enhance research collaboration through
                    meaningful academic exchange, conferences, workshops, and
                    scholarly publications, fostering capacity building and
                    global sociological dialogue.
                  </p>
                  <p className="mt-4 text-lg text-ink-light leading-relaxed">
                    Our scope is broader and more inclusive than existing national
                    associations, focusing on international cooperation, regional
                    inclusivity, and interdisciplinary engagement across the
                    entire South Asian region.
                  </p>
                </div>
              </div>
            </Card>

            {/* Vision */}
            <Card className="p-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold-dark mb-3">
                Our Vision
              </h3>
              <h4 className="text-2xl font-black text-ink font-heading">
                Transcending Boundaries
              </h4>
              <p className="mt-4 text-ink-light leading-relaxed">
                To be the premier sociological society in South Asia,
                transcending national boundaries and reflecting the diverse
                sociological landscape of the entire region — from India to
                Bangladesh, Nepal, Sri Lanka, and beyond.
              </p>
            </Card>

            {/* Membership */}
            <Card className="p-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold-dark mb-3">
                Membership
              </h3>
              <h4 className="text-2xl font-black text-ink font-heading">
                Open to All
              </h4>
              <p className="mt-4 text-ink-light leading-relaxed">
                SASS offers four membership categories: Institutional, Individual,
                Student, and Affiliated Social Science Societies — ensuring
                accessibility for all levels of academic engagement.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Core Activities */}
      <section className="bg-off-white border-t border-ink/10 py-24 lg:py-32">
        <Container>
          <SectionHeading
            label="What We Do"
            title="Core Activities"
            description="SASS is dedicated to advancing sociological knowledge through a wide range of academic activities."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <Card key={activity.title} className="p-6">
                <activity.icon className="w-8 h-8 text-brand-teal mb-4" />
                <h3 className="text-lg font-bold text-ink font-heading">
                  {activity.title}
                </h3>
                <p className="mt-2 text-sm text-ink-light leading-relaxed">
                  {activity.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
