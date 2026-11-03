import type { Metadata } from "next";
import Image from "next/image";
import { Award } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Card } from "@/frontend/components/ui/card";
import { Container } from "@/frontend/components/ui/container";
import { PageHero } from "@/frontend/components/ui/page-hero";
import { SectionHeading } from "@/frontend/components/ui/section-heading";
import { lifetimeAchievementAward } from "@/frontend/content/awards";

export const metadata: Metadata = {
  title: "Achievement Awards",
  description:
    "The SASS Lifetime Achievement Award recognises outstanding contributions to sociology.",
};

export default function AchievementAwardsPage() {
  const { title, introduction, citation, honourees, photo } =
    lifetimeAchievementAward;

  return (
    <>
      <PageHero
        title="Achievement Awards"
        subtitle="Recognizing outstanding contributions to sociological research and practice."
      />

      <section className="py-24 lg:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:items-start">
            <div>
              <SectionHeading label="Our First Awards" title={title} />
              <p className="text-lg text-ink-light leading-relaxed">
                {introduction}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {honourees.map((name) => (
                  <Card key={name} className="p-6">
                    <div className="w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center mb-4">
                      <Award className="w-6 h-6 text-brand-gold-dark" />
                    </div>
                    <h3 className="text-xl font-black text-ink font-heading">
                      {name}
                    </h3>
                    <p className="mt-2 text-sm text-ink-light leading-relaxed">
                      {citation}
                    </p>
                  </Card>
                ))}
              </div>

              <Button
                href="/conferences/gallery"
                variant="outline"
                size="sm"
                className="mt-8"
              >
                View Conference Gallery
              </Button>
            </div>

            <figure>
              <Image
                src={photo.src}
                alt={photo.caption}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 1024px) 100vw, 400px"
                className="w-full h-auto rounded-lg shadow-sm"
              />
              <figcaption className="mt-3 text-sm text-ink-muted">
                {photo.caption}
              </figcaption>
            </figure>
          </div>
        </Container>
      </section>
    </>
  );
}
