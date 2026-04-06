import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

export const metadata: Metadata = {
  title: "SASS Gallery",
  description: "Photo gallery from SASS conferences and events.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        title="SASS Gallery"
        subtitle="Moments captured from our international conferences and events."
      />

      <section className="py-24 lg:py-32">
        <Container>
          <GalleryGrid />
        </Container>
      </section>
    </>
  );
}
