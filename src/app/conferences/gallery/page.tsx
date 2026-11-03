import path from "node:path";
import type { Metadata } from "next";
import { loadGallery } from "@/backend/gallery";
import { GalleryGrid } from "@/frontend/components/gallery/gallery-grid";
import { Container } from "@/frontend/components/ui/container";
import { PageHero } from "@/frontend/components/ui/page-hero";

export const metadata: Metadata = {
  title: "SASS Gallery",
  description: "Photo gallery from SASS conferences and events.",
};

// Drop photos into these folders under public/ and rebuild.
const GALLERY_SOURCES = [
  {
    id: "3rd",
    label: "3rd Conference (Singapore & Malaysia 2026)",
    folder: "images/conferences/3rd-conference",
  },
  {
    id: "2nd",
    label: "2nd Conference (Dubai 2025)",
    folder: "images/conferences/2nd-conference",
  },
  {
    id: "1st",
    label: "1st Conference (Online 2023)",
    folder: "images/conferences/1st-conference",
  },
];

export default async function GalleryPage() {
  const conferences = await loadGallery(
    GALLERY_SOURCES,
    path.join(process.cwd(), "public")
  );

  return (
    <>
      <PageHero
        title="SASS Gallery"
        subtitle="Moments captured from our international conferences and events."
      />

      <section className="py-24 lg:py-32">
        <Container>
          {conferences.length > 0 ? (
            <GalleryGrid conferences={conferences} />
          ) : (
            <p className="text-center text-ink-light">
              Photos from our conferences are coming soon.
            </p>
          )}
        </Container>
      </section>
    </>
  );
}
