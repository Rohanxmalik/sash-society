import Link from "next/link";
import { getOverview } from "@/backend/admin/reports";
import { requireAdmin } from "@/backend/auth/session";
import { getDb } from "@/backend/db";
import { Card } from "@/frontend/components/ui/card";
import { formatMoney } from "@/shared/money";

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href?: string;
}) {
  const content = (
    <Card hover={false} className="p-5 h-full">
      <p className="text-xs uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink font-heading">{value}</p>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function AdminOverviewPage() {
  await requireAdmin();
  const overview = await getOverview(getDb(), new Date());

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black text-ink font-heading">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          label="Active Members"
          value={overview.activeMembers}
          href="/admin/members?status=active"
        />
        <Stat
          label="Waiting for Approval"
          value={overview.pendingApprovals}
          href="/admin/members?status=pending_approval"
        />
        <Stat label="Accounts" value={overview.accounts} href="/admin/members" />
        <Stat
          label="Event Registrations"
          value={overview.confirmedRegistrations}
          href="/admin/events"
        />
        <Stat
          label="Journal Work to Review"
          value={overview.papersToReview}
          href="/admin/journal"
        />
        <Stat
          label="Payments to Review"
          value={overview.needsReview}
          href="/admin/payments"
        />
        {overview.revenue.map(({ currency, amountMinor }) => (
          <Stat
            key={currency}
            label={`Collected (${currency})`}
            value={formatMoney(amountMinor, currency)}
            href="/admin/payments"
          />
        ))}
      </div>
    </div>
  );
}
