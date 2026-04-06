import type { Metadata } from "next";
import { CommitteePage } from "@/components/committees/committee-page";
import { regionalCommittee } from "@/data/committees/regional";

export const metadata: Metadata = {
  title: "Regional Committee",
  description: "Meet the members of the SASS Regional Committee.",
};

export default function RegionalCommitteePage() {
  return (
    <CommitteePage
      title="Regional Committee"
      subtitle="Regional representatives fostering local engagement and community building."
      members={regionalCommittee}
    />
  );
}
