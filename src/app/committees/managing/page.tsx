import type { Metadata } from "next";
import { CommitteePage } from "@/frontend/components/committees/committee-page";
import { managingCommittee } from "@/frontend/content/committees/managing";

export const metadata: Metadata = {
  title: "Managing Committee",
  description: "Meet the office-bearers and members of the SASS Managing Committee.",
};

export default function ManagingCommitteePage() {
  return (
    <CommitteePage
      title="Managing Committee"
      subtitle="The office-bearers and members who run the Society."
      members={managingCommittee}
    />
  );
}
