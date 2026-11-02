import Link from "next/link";
import { listMembers } from "@/backend/admin/members";
import { requireAdmin } from "@/backend/auth/session";
import { getDb } from "@/backend/db";
import { AdminTable, Cell } from "@/frontend/components/admin/admin-table";
import { Button } from "@/frontend/components/ui/button";
import { FormField } from "@/frontend/components/ui/form-field";
import { formatDateIndia } from "@/shared/dates";
import { membershipStatusLabels, statusLabel } from "@/shared/membership-status";
import { findPlan, membershipPlans } from "@/shared/plans";

const PAGE_SIZE = 50;
const SELECT_CLASSES =
  "w-full border border-ink/20 rounded-sm px-4 py-3 text-sm bg-white";

type Search = { q?: string; plan?: string; status?: string; page?: string };

const dateCell = (date: Date | null) => (date ? formatDateIndia(date) : null);

function pageLink(search: Search, page: number) {
  const params = new URLSearchParams({
    ...Object.fromEntries(Object.entries(search).filter(([, value]) => value)),
    page: String(page),
  });
  return `/admin/members?${params}`;
}

function Filters({ q, plan, status }: Search) {
  return (
    <form className="grid gap-4 sm:grid-cols-4 items-end">
      <FormField
        label="Search"
        name="q"
        defaultValue={q}
        placeholder="Name, email, phone or number"
      />
      <div>
        <label htmlFor="plan" className="block text-sm font-medium text-ink mb-1.5">
          Plan
        </label>
        <select id="plan" name="plan" defaultValue={plan} className={SELECT_CLASSES}>
          <option value="">All plans</option>
          {membershipPlans.map(({ slug, name }) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-ink mb-1.5">
          Status
        </label>
        <select id="status" name="status" defaultValue={status} className={SELECT_CLASSES}>
          <option value="">All statuses</option>
          {Object.entries(membershipStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
          <option value="none">No membership</option>
        </select>
      </div>
      <Button type="submit" variant="secondary" size="sm" className="py-3">
        Apply
      </Button>
    </form>
  );
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requireAdmin();
  const search = await searchParams;
  const page = Math.max(1, Number(search.page) || 1);

  const { rows, total } = await listMembers(
    getDb(),
    { ...search, page, pageSize: PAGE_SIZE },
    new Date()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-ink font-heading">
          Members ({total})
        </h1>
        <Button
          href="/api/admin/export/members"
          variant="outline"
          size="sm"
          fileLink
        >
          Download Excel (CSV)
        </Button>
      </div>

      <Filters {...search} />

      <AdminTable
        empty={rows.length === 0}
        headers={["Name", "Email", "Phone", "Plan", "Status", "Number", "Joined", "Expires"]}
      >
        {rows.map((row) => (
          <tr key={row.id}>
            <Cell>{row.name}</Cell>
            <Cell>
              <Link
                href={`/admin/members/${row.id}`}
                className="text-brand-teal hover:underline"
              >
                {row.email}
              </Link>
            </Cell>
            <Cell>{row.phone}</Cell>
            <Cell>{findPlan(row.planSlug)?.name}</Cell>
            <Cell>{statusLabel(row.status)}</Cell>
            <Cell>{row.memberNumber}</Cell>
            <Cell>{dateCell(row.startsAt)}</Cell>
            <Cell>{dateCell(row.expiresAt)}</Cell>
          </tr>
        ))}
      </AdminTable>

      {total > PAGE_SIZE && (
        <div className="flex gap-3 text-sm">
          {page > 1 && <Link href={pageLink(search, page - 1)}>Previous</Link>}
          <span className="text-ink-muted">
            Page {page} of {Math.ceil(total / PAGE_SIZE)}
          </span>
          {page * PAGE_SIZE < total && (
            <Link href={pageLink(search, page + 1)}>Next</Link>
          )}
        </div>
      )}
    </div>
  );
}
