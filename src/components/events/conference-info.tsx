import { Mail, Phone, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ConferenceDetails } from "@/types";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-12">
      <h3 className="text-xl font-black text-ink font-heading mb-6">{title}</h3>
      {children}
    </div>
  );
}

export function ConferenceInfo({ details }: { details: ConferenceDetails }) {
  return (
    <>
      <Section title="About the Conference">
        <p className="text-ink-light leading-relaxed">{details.summary}</p>
        <p className="mt-4 text-brand-dark-teal font-medium italic leading-relaxed">
          &ldquo;{details.coreQuestion}&rdquo;
        </p>
        <p className="mt-4 text-sm text-ink-light">
          Organized {details.organizers}, at {details.venue}.
        </p>
      </Section>

      <div className="grid gap-8 sm:grid-cols-2">
        <Section title="Important Dates">
          <dl className="space-y-3">
            {details.importantDates.map(({ label, date }) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b border-ink/5 pb-2 text-sm"
              >
                <dt className="text-ink-light">{label}</dt>
                <dd className="font-semibold text-ink text-right">{date}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Registration Fee">
          <dl className="space-y-3">
            {details.fees.map(({ label, amount }) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b border-ink/5 pb-2 text-sm"
              >
                <dt className="text-ink-light">{label}</dt>
                <dd className="font-semibold text-ink">{amount}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-ink-light leading-relaxed">
            {details.publicationNote}
          </p>
        </Section>
      </div>

      <Section title="Conference Sub-Themes">
        <div className="grid gap-3 sm:grid-cols-2">
          {details.subThemes.map(({ title, topics }, index) => (
            <Card key={title} className="p-4">
              <p className="text-sm font-semibold text-ink">
                {index + 1}. {title}
              </p>
              <ul className="mt-2 space-y-1">
                {topics.map((topic) => (
                  <li key={topic} className="text-xs text-ink-light">
                    {topic}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Who Should Attend">
        <div className="grid gap-3 sm:grid-cols-2">
          {details.audience.map((person) => (
            <div key={person} className="flex items-center gap-3">
              <Users className="w-4 h-4 text-brand-teal" />
              <span className="text-sm text-ink-light">{person}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Submission Guidelines">
        <ul className="list-disc pl-5 space-y-2 text-sm text-ink-light">
          {details.submissionGuidelines.map((guideline) => (
            <li key={guideline}>{guideline}</li>
          ))}
        </ul>
      </Section>

      <Section title="Organizing Committee">
        <dl className="space-y-4">
          {details.committee.map(({ role, members }) => (
            <div
              key={role}
              className="grid gap-1 sm:grid-cols-[220px_1fr] border-b border-ink/5 pb-3"
            >
              <dt className="text-sm font-semibold text-brand-dark-teal">
                {role}
              </dt>
              <dd className="text-sm text-ink-light space-y-1">
                {members.map((member) => (
                  <p key={member}>{member}</p>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Contact & Travel">
        <ul className="space-y-2">
          {details.contacts.map(({ label, value, href }) => {
            const Icon = href.startsWith("mailto:") ? Mail : Phone;
            return (
              <li key={value} className="flex items-center gap-3 text-sm">
                <Icon className="w-4 h-4 text-brand-teal shrink-0" />
                <span className="text-ink-light">
                  {label}:{" "}
                  <a
                    href={href}
                    className="font-medium text-brand-dark-teal hover:underline break-all"
                  >
                    {value}
                  </a>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm text-ink-light leading-relaxed">
          {details.travelNote}
        </p>
      </Section>
    </>
  );
}
