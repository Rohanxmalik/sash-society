import { requireAdmin } from "@/backend/auth/session";
import { getDb } from "@/backend/db";
import {
  approvePaperAction,
  rejectPaperAction,
  removePaperAction,
} from "@/backend/journal/actions";
import { listPapersForAdmin } from "@/backend/journal/repository";
import { AdminTable, Cell } from "@/frontend/components/admin/admin-table";
import { ConfirmButton } from "@/frontend/components/admin/confirm-button";
import { AddPaperForm } from "@/frontend/components/journal/add-paper-form";
import { Button } from "@/frontend/components/ui/button";
import { Card } from "@/frontend/components/ui/card";
import { FormAlert } from "@/frontend/components/ui/form-alert";
import { FormField } from "@/frontend/components/ui/form-field";
import { formatDateIndia } from "@/shared/dates";
import { paperStatusLabels } from "@/shared/journal-status";

type AdminPaper = Awaited<ReturnType<typeof listPapersForAdmin>>[number];

function PaperActions({ paper }: { paper: AdminPaper }) {
  const hidden = <input type="hidden" name="paperId" value={paper.id} />;

  if (paper.status === "pending") {
    return (
      <div className="space-y-3 min-w-48">
        <form action={approvePaperAction}>
          {hidden}
          <Button type="submit" size="sm" variant="secondary" className="w-full">
            Approve
          </Button>
        </form>
        <form action={rejectPaperAction} className="space-y-2">
          {hidden}
          <FormField label="Reason (sent to the author)" name="reason" />
          <ConfirmButton question="Reject this work? The author will be told and the file will be deleted.">
            Reject
          </ConfirmButton>
        </form>
      </div>
    );
  }

  if (paper.status === "published") {
    return (
      <form action={removePaperAction}>
        {hidden}
        <ConfirmButton question="Take this work down from the journal?">
          Remove
        </ConfirmButton>
      </form>
    );
  }

  return null;
}

export default async function AdminJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireAdmin();
  const { notice } = await searchParams;
  const papers = await listPapersForAdmin(getDb());

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black text-ink font-heading">Journal</h1>

      {notice && <FormAlert tone="success">{notice}</FormAlert>}

      <AdminTable
        empty={papers.length === 0}
        headers={["Work", "Type", "Sent By", "Date", "Status", "File", "Actions"]}
      >
        {papers.map((paper) => (
          <tr key={paper.id}>
            <Cell>
              <span className="block font-medium text-ink">{paper.title}</span>
              <span className="block text-xs">{paper.authors}</span>
              {paper.abstract && (
                <details className="mt-1 text-xs">
                  <summary className="cursor-pointer text-brand-teal">
                    Abstract
                  </summary>
                  <p className="mt-1 max-w-md leading-relaxed">{paper.abstract}</p>
                </details>
              )}
            </Cell>
            <Cell>{paper.articleType}</Cell>
            <Cell>{paper.submitterEmail ?? "Added by admin"}</Cell>
            <Cell>{formatDateIndia(paper.publishedAt ?? paper.createdAt)}</Cell>
            <Cell>{paperStatusLabels[paper.status]}</Cell>
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
            <Cell>
              <PaperActions paper={paper} />
            </Cell>
          </tr>
        ))}
      </AdminTable>

      <div className="space-y-3 max-w-2xl">
        <h2 className="text-lg font-bold text-ink font-heading">
          Add a Published Journal
        </h2>
        <p className="text-sm text-ink-light">
          For issues SASS has already published. These appear straight away,
          without review.
        </p>
        <Card hover={false} className="p-6">
          <AddPaperForm />
        </Card>
      </div>
    </div>
  );
}
