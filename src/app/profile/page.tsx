import type { Metadata } from "next";
import { isAdminEmail, requireSession } from "@/backend/auth/session";
import { getDb } from "@/backend/db";
import {
  findLatestMembership,
  findPaymentForMembership,
  listMemberRegistrations,
} from "@/backend/members/repository";
import { displayStatus } from "@/backend/members/rules";
import { findProfile } from "@/backend/profiles/repository";
import { MembershipCard } from "@/frontend/components/profile/membership-card";
import { PhotoUploader } from "@/frontend/components/profile/photo-uploader";
import { ProfileForm } from "@/frontend/components/profile/profile-form";
import { SignOutButton } from "@/frontend/components/profile/sign-out-button";
import { Button } from "@/frontend/components/ui/button";
import { Card } from "@/frontend/components/ui/card";
import { Container } from "@/frontend/components/ui/container";
import { PageHero } from "@/frontend/components/ui/page-hero";
import { findEvent } from "@/shared/events";
import { findPlan } from "@/shared/plans";

export const metadata: Metadata = {
  title: "My Profile",
  robots: { index: false },
};

async function loadMembership(userId: string) {
  const db = getDb();
  const membership = await findLatestMembership(db, userId);
  if (!membership) return null;

  const payment = await findPaymentForMembership(db, membership.id);
  return {
    id: membership.id,
    planName: findPlan(membership.planSlug)?.name ?? membership.planSlug,
    status: displayStatus(membership, new Date()),
    memberNumber: membership.memberNumber,
    startsAt: membership.startsAt,
    expiresAt: membership.expiresAt,
    receiptPaymentId: payment?.paidAt ? payment.id : null,
  };
}

export default async function ProfilePage() {
  const { user } = await requireSession();
  const db = getDb();

  const [profile, membership, registrations] = await Promise.all([
    findProfile(db, user.id),
    loadMembership(user.id),
    listMemberRegistrations(db, user.id),
  ]);

  return (
    <>
      <PageHero title="My Profile" subtitle={user.email} />

      <section className="py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl space-y-8">
            <MembershipCard membership={membership} />

            {registrations.length > 0 && (
              <Card hover={false} className="p-8">
                <h2 className="text-lg font-bold text-ink font-heading">
                  Event Registrations
                </h2>
                <ul className="mt-4 divide-y divide-ink/5">
                  {registrations.map((registration) => {
                    const event = findEvent(registration.eventId);
                    return (
                      <li
                        key={registration.id}
                        className="py-3 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {event?.shortTitle ?? event?.title ?? registration.eventId}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {registration.registrationNumber}
                          </p>
                        </div>
                        <a
                          href={`/api/documents/receipt/${registration.paymentId}`}
                          className="text-sm text-brand-teal hover:underline"
                        >
                          Download Receipt
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}

            <Card hover={false} className="p-8">
              <h2 className="text-lg font-bold text-ink font-heading mb-5">
                Your Details
              </h2>
              {profile && (
                <div className="mb-6">
                  <PhotoUploader initial={profile.photo} />
                </div>
              )}
              <ProfileForm
                initial={{
                  fullName: profile?.fullName ?? user.name,
                  phone: profile?.phone ?? "",
                  designation: profile?.designation ?? "",
                  institution: profile?.institution ?? "",
                  country: profile?.country ?? "",
                  education: profile?.education ?? "",
                  experience: profile?.experience ?? "",
                  publications: profile?.publications ?? "",
                  website: profile?.website ?? "",
                  showInDirectory: profile?.showInDirectory ?? true,
                }}
              />
            </Card>

            <div className="flex flex-wrap items-center gap-3">
              <SignOutButton />
              {isAdminEmail(user.email) && (
                <Button href="/admin" variant="secondary" size="sm">
                  Admin Panel
                </Button>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
