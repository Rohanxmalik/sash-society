import type { Metadata } from "next";
import { connection } from "next/server";
import { getDb } from "@/backend/db";
import { listPublishedPapers } from "@/backend/journal/repository";
import { PaperCard } from "@/frontend/components/journal/paper-card";
import { Button } from "@/frontend/components/ui/button";
import { PageHero } from "@/frontend/components/ui/page-hero";
import { Container } from "@/frontend/components/ui/container";
import { Card } from "@/frontend/components/ui/card";
import { SectionHeading } from "@/frontend/components/ui/section-heading";
import { Badge } from "@/frontend/components/ui/badge";
import { ArrowRight, BookOpen, FileText, Shield, Clock } from "lucide-react";

const LATEST_PAPER_COUNT = 3;

export const metadata: Metadata = {
  title: "E-Journal - Explorations",
  description: "Explorations: The E-Journal of the South Asian Sociological Society.",
};

export default async function JournalPage() {
  // Runs per request, so `next build` does not need the database.
  await connection();
  const latest = await listPublishedPapers(getDb(), LATEST_PAPER_COUNT);

  return (
    <>
      <PageHero
        title="Explorations"
        subtitle="The E-Journal of the South Asian Sociological Society"
      />

      <section className="py-24 lg:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_350px]">
            {/* Main content */}
            <div>
              <SectionHeading
                label="About the Journal"
                title="Rigorous Sociological Research"
              />
              <div className="space-y-6 text-ink-light leading-relaxed">
                <p>
                  <strong className="text-ink">Explorations</strong> is the
                  official double-blind peer-reviewed journal of the South Asian
                  Sociological Society. Published twice yearly in
                  April and October, it features rigorous sociological research
                  using quantitative, qualitative, or mixed methods.
                </p>
                <p>
                  The journal focuses on South Asian societies and related topics,
                  publishing research articles, interviews, commentaries, and
                  academic debates. Copyright is retained by SASS and authors upon
                  publication.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid gap-4 sm:grid-cols-2 mt-8">
                <Card className="p-5">
                  <BookOpen className="w-6 h-6 text-brand-teal mb-2" />
                  <h3 className="font-bold text-ink text-sm">Free to Read</h3>
                  <p className="text-xs text-ink-muted mt-1">
                    Published articles are free to read once you log in.
                  </p>
                </Card>
                <Card className="p-5">
                  <Shield className="w-6 h-6 text-brand-teal mb-2" />
                  <h3 className="font-bold text-ink text-sm">Peer Reviewed</h3>
                  <p className="text-xs text-ink-muted mt-1">
                    Double-blind peer review process ensures quality.
                  </p>
                </Card>
                <Card className="p-5">
                  <Clock className="w-6 h-6 text-brand-teal mb-2" />
                  <h3 className="font-bold text-ink text-sm">Biannual</h3>
                  <p className="text-xs text-ink-muted mt-1">
                    Published twice yearly in April and October.
                  </p>
                </Card>
                <Card className="p-5">
                  <FileText className="w-6 h-6 text-brand-teal mb-2" />
                  <h3 className="font-bold text-ink text-sm">Multi-format</h3>
                  <p className="text-xs text-ink-muted mt-1">
                    Research articles, interviews, commentaries, and debates.
                  </p>
                </Card>
              </div>

              {/* Latest published work */}
              <div className="mt-12">
                <h2 className="text-2xl font-black text-ink font-heading">
                  Latest Journals
                </h2>
                <div className="mt-6 space-y-4">
                  {latest.length > 0 ? (
                    latest.map((paper) => (
                      <PaperCard key={paper.id} paper={paper} />
                    ))
                  ) : (
                    <p className="text-sm text-ink-light">
                      Published articles will appear here soon.
                    </p>
                  )}
                </div>
                <Button
                  href="/journal/archive"
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                >
                  View All Journals
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 bg-brand-dark-teal text-white border-none">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold mb-3">
                  Submit Your Work
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Submissions are restricted to registered, paid SASS members.
                  Ensure your research aligns with the journal&apos;s scope and
                  follows our submission guidelines.
                </p>
                <Button href="/journal/submit" size="sm" className="mt-4">
                  Submit Your Work
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold-dark mb-3">
                  Featured Publication
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-cream rounded-sm">
                    <Badge variant="gold" className="mb-2">Special Edition</Badge>
                    <p className="text-sm font-medium text-ink">
                      SASS Journal: Climate Migration
                    </p>
                    <p className="text-xs text-ink-muted mt-1">Published 2025</p>
                  </div>
                  <div className="p-3 bg-cream rounded-sm">
                    <p className="text-sm font-medium text-ink">
                      Explorations E-Journal
                    </p>
                    <p className="text-xs text-ink-muted mt-1">
                      Primary publication vehicle
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
