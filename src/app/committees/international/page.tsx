import type { Metadata } from "next";
import { CommitteePage } from "@/components/committees/committee-page";
import { internationalCommittee } from "@/data/committees/international";

export const metadata: Metadata = {
  title: "International Committee",
  description: "Meet the members of the SASS International Committee from around the world.",
};

export default function InternationalCommitteePage() {
  return (
    <CommitteePage
      title="International Committee"
      subtitle="Scholars from around the world contributing to SASS's global reach."
      members={internationalCommittee}
    />
  );
}
