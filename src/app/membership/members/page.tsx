import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getDb } from "@/backend/db";
import { listDirectory } from "@/backend/profiles/repository";
import { DEFAULT_DESIGNATION, memberTypeOf } from "@/shared/plans";
import { MemberDirectory } from "@/frontend/components/membership/member-directory";
import { Container } from "@/frontend/components/ui/container";
import { PageHero } from "@/frontend/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Members List",
  description: "Directory of SASS members.",
};

export default async function MembersListPage() {
  // Runs per request, so `next build` does not need the database.
  await connection();
  const rows = await listDirectory(getDb(), new Date());
  const members = rows.map((row) => ({
    fullName: row.fullName,
    memberType: memberTypeOf(row.planSlug),
    designation: row.designation === DEFAULT_DESIGNATION ? "" : row.designation,
    institution: row.institution ?? "",
  }));

  return (
    <>
      <PageHero
        title="Members Directory"
        subtitle="A society of members committed to knowledge, growth, and shared purpose."
      />

      <section className="py-24 lg:py-32">
        <Container>
          <MemberDirectory members={members} />

          <p className="mt-12 text-center text-sm text-ink-muted">
            Want to become a SASS member?{" "}
            <Link
              href="/membership"
              className="text-brand-dark-teal font-medium hover:underline"
            >
              View membership plans
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
