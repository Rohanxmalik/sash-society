import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/backend/auth/session";
import { getDb } from "@/backend/db";
import { findProfile } from "@/backend/profiles/repository";
import { AuthShell } from "@/frontend/components/auth/auth-shell";
import { RegistrationForm } from "@/frontend/components/events/registration-form";
import { formatDateIndia } from "@/shared/dates";
import { findEvent, isOptionOpen } from "@/shared/events";

export const metadata: Metadata = {
  title: "Event Registration",
  description: "Register and pay for a SASS conference.",
};

async function prefillFor(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session) return {};

  const { id, name, email } = session.user;
  const profile = await findProfile(getDb(), id);
  return {
    email,
    fullName: profile?.fullName ?? name,
    whatsapp: profile?.phone,
    designation: profile?.designation,
    affiliation: profile?.institution ?? undefined,
  };
}

export default async function EventRegistrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = findEvent(id);
  if (!event?.registration) notFound();

  const now = new Date();
  const session = await getSession();
  const options = event.registration.options.map((option) => ({
    id: option.id,
    label: option.label,
    amountMinor: option.amountMinor,
    currency: option.currency,
    closesLabel: formatDateIndia(new Date(option.closesAt)),
    open: isOptionOpen(option, now),
  }));

  return (
    <AuthShell title="Event Registration" subtitle={event.title}>
      <RegistrationForm
        eventId={event.id}
        options={options}
        subThemes={event.details?.subThemes.map(({ title }) => title) ?? []}
        prefill={await prefillFor(session)}
      />
    </AuthShell>
  );
}
