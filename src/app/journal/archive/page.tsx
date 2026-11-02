import type { Metadata } from "next";
import { connection } from "next/server";
import { getDb } from "@/backend/db";
import { listPublishedPapers } from "@/backend/journal/repository";
import { PaperCard } from "@/frontend/components/journal/paper-card";
import { Button } from "@/frontend/components/ui/button";
import { Container } from "@/frontend/components/ui/container";
import { PageHero } from "@/frontend/components/ui/page-hero";

export const metadata: Metadata = {
  title: "All Journals",
  description: "Every article published in Explorations, the e-journal of SASS.",
};

export default async function JournalArchivePage() {
  // Runs per request, so `next build` does not need the database.
  await connection();
  const papers = await listPublishedPapers(getDb());

  return (
    <>
      <PageHero
        title="All Journals"
        subtitle="Browse everything published in Explorations. Log in to read."
      />

      <section className="py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl space-y-6">
            {papers.length > 0 ? (
              papers.map((paper) => <PaperCard key={paper.id} paper={paper} />)
            ) : (
              <p className="text-center text-ink-light">
                Published articles will appear here soon.
              </p>
            )}

            <div className="pt-4 text-center">
              <Button href="/journal/submit" variant="outline" size="sm">
                Submit Your Work
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
