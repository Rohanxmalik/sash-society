import { notFound } from "next/navigation";
import {
  approveAction,
  reinstateAction,
  rejectAction,
  removeAction,
  resendWelcomeAction,
  updateMemberEmailAction,
} from "@/backend/admin/actions";
import { getMemberDetail } from "@/backend/admin/members";
import { requireAdmin } from "@/backend/auth/session";
import { getDb } from "@/backend/db";
import type { Membership } from "@/backend/members/repository";
import { displayStatus } from "@/backend/members/rules";
import { AdminTable, Cell } from "@/frontend/components/admin/admin-table";
import { ConfirmButton } from "@/frontend/components/admin/confirm-button";
import { Button } from "@/frontend/components/ui/button";
import { FormAlert } from "@/frontend/components/ui/form-alert";
import { FormField } from "@/frontend/components/ui/form-field";
import { formatDateIndia } from "@/shared/dates";
import { hasRealEmail } from "@/shared/no-email";
import { findEvent } from "@/shared/events";
import { statusLabel } from "@/shared/membership-status";
import { formatMoney, type Currency } from "@/shared/money";
import { findPlan } from "@/shared/plans";

const dateCell = (date: Date | null) => (date ? formatDateIndia(date) : null);

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-ink-muted">{label}</dt>
      <dd className="mt-1 text-sm text-ink whitespace-pre-line">{value}</dd>
    </div>
  );
}

function MembershipActions({ membership }: { membership: Membership }) {
  const hidden = (
    <>
      <input type="hidden" name="membershipId" value={membership.id} />
      <input type="hidden" name="userId" value={membership.userId} />
    </>
  );

  if (membership.status === "pending_approval") {
    return (
      <div className="flex flex-wrap gap-2">
        <form action={approveAction}>
          {hidden}
          <Button type="submit" size="sm" variant="secondary">
            Approve
          </Button>
        </form>
        <form action={rejectAction}>
          {hidden}
          <ConfirmButton question="Reject this application and refund the payment? This cannot be undone.">
            Reject and Refund
          </ConfirmButton>
        </form>
      </div>
    );
  }

  if (membership.status === "active") {
    return (
      <div className="flex flex-wrap gap-2">
        <form action={resendWelcomeAction}>
          {hidden}
          <Button type="submit" size="sm" variant="outline">
            Resend Welcome Email
          </Button>
        </form>
        <Button
          href={`/api/documents/certificate/${membership.id}`}
          size="sm"
          variant="outline"
          fileLink
        >
          Certificate
        </Button>
      </div>
    );
  }

  return null;
}

export default async function AdminMemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { notice } = await searchParams;

  const member = await getMemberDetail(getDb(), id);
  if (!member) notFound();

  const { profile } = member;
  const now = new Date();
  const memberHasEmail = hasRealEmail(member.email);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-ink font-heading">{member.name}</h1>
        <p className="text-sm text-ink-light break-all">
          {memberHasEmail ? member.email : "No email on file"}
        </p>
      </div>

      {notice && <FormAlert tone="success">{notice}</FormAlert>}

      <form
        action={updateMemberEmailAction}
        className="flex flex-wrap items-end gap-3 max-w-lg"
      >
        <input type="hidden" name="userId" value={member.id} />
        <div className="flex-1 min-w-56">
          <FormField
            label="Email Address"
            name="email"
            type="email"
            required
            defaultValue={memberHasEmail ? member.email : ""}
          />
        </div>
        <Button type="submit" size="sm" variant="outline" className="mb-1">
          Update Email
        </Button>
      </form>

      <dl className="grid gap-4 sm:grid-cols-3">
        <Field label="Phone" value={profile?.phone} />
        <Field label="Designation" value={profile?.designation} />
        <Field label="Institution" value={profile?.institution} />
        <Field label="Country" value={profile?.country} />
        <Field label="Website" value={profile?.website} />
        <Field label="Signed Up" value={formatDateIndia(member.createdAt)} />
        <Field label="Removal Reason" value={member.banned ? member.banReason : null} />
      </dl>
      <dl className="grid gap-4">
        <Field label="Education" value={profile?.education} />
        <Field label="Experience" value={profile?.experience} />
        <Field label="Publications" value={profile?.publications} />
      </dl>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-ink font-heading">Membership</h2>
        <AdminTable
          empty={member.memberships.length === 0}
          headers={["Plan", "Status", "Number", "Joined", "Expires", "Actions"]}
        >
          {member.memberships.map((membership) => (
            <tr key={membership.id}>
              <Cell>{findPlan(membership.planSlug)?.name ?? membership.planSlug}</Cell>
              <Cell>{statusLabel(displayStatus(membership, now))}</Cell>
              <Cell>{membership.memberNumber}</Cell>
              <Cell>{dateCell(membership.startsAt)}</Cell>
              <Cell>{dateCell(membership.expiresAt)}</Cell>
              <Cell>
                <MembershipActions membership={membership} />
              </Cell>
            </tr>
          ))}
        </AdminTable>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-ink font-heading">Payments</h2>
        <AdminTable
          empty={member.payments.length === 0}
          headers={["Date", "Description", "Amount", "Status", "Receipt"]}
        >
          {member.payments.map((payment) => (
            <tr key={payment.id}>
              <Cell>{dateCell(payment.paidAt)}</Cell>
              <Cell>{payment.description}</Cell>
              <Cell>{formatMoney(payment.amountMinor, payment.currency as Currency)}</Cell>
              <Cell>{payment.status}</Cell>
              <Cell>
                {payment.paidAt && (
                  <a
                    href={`/api/documents/receipt/${payment.id}`}
                    className="text-brand-teal hover:underline"
                  >
                    {payment.receiptNumber}
                  </a>
                )}
              </Cell>
            </tr>
          ))}
        </AdminTable>
      </div>

      {member.registrations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-ink font-heading">Event Registrations</h2>
          <AdminTable headers={["Event", "Number", "Attending"]}>
            {member.registrations.map((registration) => {
              const event = findEvent(registration.eventId);
              return (
                <tr key={registration.id}>
                  <Cell>{event?.shortTitle ?? event?.title ?? registration.eventId}</Cell>
                  <Cell>{registration.registrationNumber}</Cell>
                  <Cell>{registration.optionId}</Cell>
                </tr>
              );
            })}
          </AdminTable>
        </div>
      )}

      <div className="border border-red-200 rounded-sm p-5 space-y-4">
        <h2 className="text-lg font-bold text-ink font-heading">Remove from Society</h2>
        {member.banned ? (
          <form action={reinstateAction}>
            <input type="hidden" name="userId" value={member.id} />
            <Button type="submit" size="sm" variant="secondary">
              Reinstate Member
            </Button>
          </form>
        ) : (
          <form action={removeAction} className="space-y-4 max-w-md">
            <input type="hidden" name="userId" value={member.id} />
            <p className="text-sm text-ink-light">
              Signs them out, blocks their login and takes them off the members
              list. No refund is issued. You can reinstate them later.
            </p>
            <FormField label="Reason *" name="reason" required />
            <ConfirmButton question="Remove this member from the society?">
              Remove Member
            </ConfirmButton>
          </form>
        )}
      </div>
    </div>
  );
}
