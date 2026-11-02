import { notFound } from "next/navigation";
import { listRegistrations } from "@/backend/admin/reports";
import { requireAdmin } from "@/backend/auth/session";
import { getDb } from "@/backend/db";
import { AdminTable, Cell } from "@/frontend/components/admin/admin-table";
import { Button } from "@/frontend/components/ui/button";
import { formatDateIndia } from "@/shared/dates";
import { findEvent } from "@/shared/events";
import { formatMoney, type Currency } from "@/shared/money";

export default async function AdminEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const event = findEvent(id);
  if (!event?.registration) notFound();

  const options = event.registration.options;
  const rows = await listRegistrations(getDb(), id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-ink font-heading">
          {event.shortTitle ?? event.title} ({rows.length})
        </h1>
        <Button
          href={`/api/admin/export/registrations?event=${encodeURIComponent(id)}`}
          variant="outline"
          size="sm"
          fileLink
        >
          Download Excel (CSV)
        </Button>
      </div>

      <AdminTable
        empty={rows.length === 0}
        headers={[
          "Number",
          "Name",
          "Email",
          "WhatsApp",
          "Affiliation",
          "Attending",
          "Paper",
          "Paid",
          "Date",
        ]}
      >
        {rows.map((row) => (
          <tr key={row.id}>
            <Cell>{row.registrationNumber}</Cell>
            <Cell>{row.fullName}</Cell>
            <Cell>{row.email}</Cell>
            <Cell>{row.whatsapp}</Cell>
            <Cell>{row.affiliation}</Cell>
            <Cell>
              {options.find((option) => option.id === row.optionId)?.label ??
                row.optionId}
            </Cell>
            <Cell>{row.paperTitle}</Cell>
            <Cell>{formatMoney(row.amountMinor, row.currency as Currency)}</Cell>
            <Cell>{row.confirmedAt ? formatDateIndia(row.confirmedAt) : null}</Cell>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
