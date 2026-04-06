import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { Users, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Members List",
  description: "Directory of SASS members.",
};

export default function MembersListPage() {
  return (
    <>
      <PageHero
        title="Members Directory"
        subtitle="A society of members committed to knowledge, growth, and shared purpose."
      />

      <section className="py-24 lg:py-32">
        <Container>
          {/* Search bar placeholder */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="text"
                placeholder="Search members..."
                className="w-full border border-ink/20 rounded-sm pl-12 pr-4 py-3 text-sm bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors"
                disabled
              />
            </div>
          </div>

          {/* Placeholder */}
          <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-brand-teal/10 flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-brand-teal" />
            </div>
            <h2 className="text-2xl font-black text-ink font-heading">
              Member Directory
            </h2>
            <p className="mt-4 text-ink-light leading-relaxed">
              The member directory is currently being set up. Members are
              requested to update their profiles and upload profile photos.
            </p>
            <p className="mt-4 text-sm text-ink-muted">
              Want to become a SASS member?{" "}
              <a
                href="/membership"
                className="text-brand-dark-teal font-medium hover:underline"
              >
                View membership plans
              </a>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
