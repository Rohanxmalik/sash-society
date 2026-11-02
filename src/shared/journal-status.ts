export type PaperStatusName = "pending" | "published" | "rejected" | "removed";

export const paperStatusLabels: Record<PaperStatusName, string> = {
  pending: "Under review",
  published: "Published",
  rejected: "Not accepted",
  removed: "Removed",
};
