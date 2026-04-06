import type { Metadata } from "next";
import { CommitteePage } from "@/components/committees/committee-page";
import { advisoryCommittee } from "@/data/committees/advisory";

export const metadata: Metadata = {
  title: "Advisory Committee",
  description: "Meet the distinguished members of the SASS Advisory Committee.",
};

export default function AdvisoryCommitteePage() {
  return (
    <CommitteePage
      title="Advisory Committee"
      subtitle="Distinguished academics guiding the strategic direction of SASS."
      members={advisoryCommittee}
    />
  );
}
