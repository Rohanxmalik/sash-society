import type { Metadata } from "next";
import { ProfileForm } from "@/components/account/profile-form";
import { SignOutButton } from "@/components/account/sign-out-button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { getDb } from "@/db";
import { findProfile } from "@/lib/profiles/repository";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false },
};

export default async function AccountPage() {
  const { user } = await requireSession();
  const profile = await findProfile(getDb(), user.id);

  return (
    <>
      <PageHero title="My Account" subtitle="Manage your SASS member details." />

      <section className="py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-2xl space-y-6">
            <Card hover={false} className="p-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold-dark mb-2">
                Your Details
              </h2>
              {!profile && (
                <p className="text-sm text-ink-light mb-4">
                  Please complete your profile before applying for membership.
                </p>
              )}
              <ProfileForm
                initial={{
                  fullName: profile?.fullName ?? user.name,
                  phone: profile?.phone ?? "",
                  country: profile?.country ?? "",
                  institution: profile?.institution ?? "",
                  qualification: profile?.qualification ?? "",
                }}
              />
            </Card>

            <Card hover={false} className="p-8">
              <p className="text-sm text-ink-light mb-4">
                Signed in as {user.email}
              </p>
              <SignOutButton />
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
