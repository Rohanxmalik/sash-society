export type MembershipStatusName =
  | "pending_approval"
  | "active"
  | "expired"
  | "rejected"
  | "removed";

export const membershipStatusLabels: Record<MembershipStatusName, string> = {
  pending_approval: "Waiting for approval",
  active: "Active",
  expired: "Expired",
  rejected: "Not approved",
  removed: "Removed",
};

export const statusLabel = (status: string | null) =>
  status
    ? (membershipStatusLabels[status as MembershipStatusName] ?? status)
    : "No membership";
