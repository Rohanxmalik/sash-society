import type { Metadata } from "next";
import { requireSession } from "@/backend/auth/session";
import { getDb } from "@/backend/db";
import { listSubmissionsBy } from "@/backend/journal/repository";
import { hasActiveMembership } from "@/backend/members/repository";
import { findProfile } from "@/backend/profiles/repository";
import { AdminTable, Cell } from "@/frontend/components/admin/admin-table";
import { SubmissionForm } from "@/frontend/components/journal/submission-form";
import { Button } from "@/frontend/components/ui/button";
import { Card } from "@/frontend/components/ui/card";
import { Container } from "@/frontend/components/ui/container";
import { PageHero } from "@/frontend/components/ui/page-hero";
import { formatDateIndia } from "@/shared/dates";
import { paperStatusLabels } from "@/shared/journal-status";

export const metadata: Metadata = {
  title: "Submit Your Work",
  description: "Send your work to Explorations, the e-journal of SASS.",
  robots: { index: false },
};

export default async function JournalSubmitPage() {
  const { user } = await requireSession();
  const db = getDb();

  const [isMember, profile, submissions] = await Promise.all([
    hasActiveMembership(db, user.id, new Date()),
    findProfile(db, user.id),
    listSubmissionsBy(db, user.id),
  ]);

  return (
    <>
      <PageHero
        title="Submit Your Work"
        subtitle="Send your work to Explorations, the e-journal of SASS."
      />

      <section className="py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl space-y-8">
            {isMember ? (
              <Card hover={false} className="p-8">
                <SubmissionForm
                  defaultAuthors={profile?.fullName ?? user.name}
                />
              </Card>
            ) : (
              <Card hover={false} className="p-8">
                <p className="text-sm text-ink-light">
                  Submissions are open to active SASS members. Choose a plan to
                  join.
                </p>
                <Button href="/membership" size="sm" className="mt-5">
                  View Membership Plans
                </Button>
              </Card>
            )}

            {submissions.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-ink font-heading">
                  Your Submissions
                </h2>
                <AdminTable headers={["Title", "Status", "Sent", "File"]}>
                  {submissions.map((paper) => (
                    <tr key={paper.id}>
                      <Cell>
                        {paper.title}
                        {paper.reviewNote && (
                          <span className="block mt-1 text-xs text-ink-muted">
                            Comment: {paper.reviewNote}
                          </span>
                        )}
                      </Cell>
                      <Cell>{paperStatusLabels[paper.status]}</Cell>
                      <Cell>{formatDateIndia(paper.createdAt)}</Cell>
                      <Cell>
                        {paper.status !== "rejected" && (
                          <a
                            href={`/api/journal/${paper.id}/file`}
                            className="text-brand-teal hover:underline"
                          >
                            View
                          </a>
                        )}
                      </Cell>
                    </tr>
                  ))}
                </AdminTable>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
