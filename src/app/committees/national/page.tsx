import type { Metadata } from "next";
import { CommitteePage } from "@/components/committees/committee-page";
import { nationalCommittee } from "@/data/committees/national";

export const metadata: Metadata = {
  title: "National Committee",
  description: "Meet the members of the SASS National Committee from across India.",
};

export default function NationalCommitteePage() {
  return (
    <CommitteePage
      title="National Committee"
      subtitle="Leading sociologists from universities across India driving national engagement."
      members={nationalCommittee}
    />
  );
}
