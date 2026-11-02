import { Download } from "lucide-react";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import { Card } from "@/frontend/components/ui/card";
import { formatDateIndia } from "@/shared/dates";
import {
  membershipStatusLabels,
  type MembershipStatusName,
} from "@/shared/membership-status";

export type MembershipSummary = {
  id: string;
  planName: string;
  status: MembershipStatusName;
  memberNumber: string | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  receiptPaymentId: string | null;
};

const canRenew = (status: MembershipStatusName) =>
  status === "expired" || status === "rejected";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-ink-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export function MembershipCard({
  membership,
}: {
  membership: MembershipSummary | null;
}) {
  if (!membership) {
    return (
      <Card hover={false} className="p-8">
        <h2 className="text-lg font-bold text-ink font-heading">Membership</h2>
        <p className="mt-2 text-sm text-ink-light">
          You are not a member yet. Choose a plan to join SASS.
        </p>
        <Button href="/membership" size="sm" className="mt-5">
          View Membership Plans
        </Button>
      </Card>
    );
  }

  const { id, planName, status, memberNumber, startsAt, expiresAt } = membership;

  return (
    <Card hover={false} className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink font-heading">{planName}</h2>
        <Badge variant={status === "active" ? "teal" : "outline"}>
          {membershipStatusLabels[status]}
        </Badge>
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        {memberNumber && <Detail label="Member Number" value={memberNumber} />}
        {startsAt && <Detail label="Joined" value={formatDateIndia(startsAt)} />}
        {status === "active" && (
          <Detail
            label="Valid Until"
            value={expiresAt ? formatDateIndia(expiresAt) : "Lifetime"}
          />
        )}
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        {status === "active" && (
          <Button
            href={`/api/documents/certificate/${id}`}
            variant="outline"
            size="sm"
            fileLink
          >
            <Download className="w-4 h-4" />
            Download Certificate
          </Button>
        )}
        {membership.receiptPaymentId && (
          <Button
            href={`/api/documents/receipt/${membership.receiptPaymentId}`}
            variant="outline"
            size="sm"
            fileLink
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </Button>
        )}
        {canRenew(status) && (
          <Button href="/membership" size="sm">
            View Membership Plans
          </Button>
        )}
      </div>
    </Card>
  );
}
