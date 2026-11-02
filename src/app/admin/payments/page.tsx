import { resendPaymentEmailAction } from "@/backend/admin/actions";
import { listPayments } from "@/backend/admin/reports";
import { requireAdmin } from "@/backend/auth/session";
import { getDb } from "@/backend/db";
import { AdminTable, Cell } from "@/frontend/components/admin/admin-table";
import { Button } from "@/frontend/components/ui/button";
import { FormAlert } from "@/frontend/components/ui/form-alert";
import { formatDateIndia } from "@/shared/dates";
import { formatMoney, type Currency } from "@/shared/money";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireAdmin();
  const { notice } = await searchParams;
  const rows = await listPayments(getDb());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-ink font-heading">Payments</h1>
        <Button
          href="/api/admin/export/payments"
          variant="outline"
          size="sm"
          fileLink
        >
          Download Excel (CSV)
        </Button>
      </div>

      {notice && <FormAlert tone="success">{notice}</FormAlert>}

      <AdminTable
        empty={rows.length === 0}
        headers={["Date", "Receipt", "Description", "Payer", "Amount", "Status", "Note", ""]}
      >
        {rows.map((row) => (
          <tr key={row.id}>
            <Cell>{row.paidAt ? formatDateIndia(row.paidAt) : null}</Cell>
            <Cell>
              <a
                href={`/api/documents/receipt/${row.id}`}
                className="text-brand-teal hover:underline whitespace-nowrap"
              >
                {row.receiptNumber}
              </a>
            </Cell>
            <Cell>{row.description}</Cell>
            <Cell>{row.memberEmail ?? row.guestEmail}</Cell>
            <Cell>{formatMoney(row.amountMinor, row.currency as Currency)}</Cell>
            <Cell>{row.status}</Cell>
            <Cell>{row.note}</Cell>
            <Cell>
              {row.status === "paid" && !row.emailSentAt && (
                <form action={resendPaymentEmailAction}>
                  <input type="hidden" name="paymentId" value={row.id} />
                  <input type="hidden" name="returnTo" value="/admin/payments" />
                  <Button type="submit" size="sm" variant="outline">
                    Send Email
                  </Button>
                </form>
              )}
            </Cell>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
