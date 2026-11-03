import Image from "next/image";
import { Card } from "@/frontend/components/ui/card";
import type { ConferenceBrochure, SpecialLecture } from "@/shared/types";
import { Section } from "./conference-info";

function Lecture({ lecture }: { lecture: SpecialLecture }) {
  return (
    <Card hover={false} className="p-0 overflow-hidden">
      <div className="grid sm:grid-cols-[170px_1fr]">
        <a
          href={lecture.poster}
          target="_blank"
          rel="noopener noreferrer"
          className="no-print relative block aspect-[3/4] bg-cream-dark"
          aria-label={`Open the poster for ${lecture.title}`}
        >
          <Image
            src={lecture.poster}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 170px"
            className="object-cover object-top"
          />
        </a>
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold-dark">
            {lecture.series}
          </p>
          <h4 className="mt-2 font-bold text-ink font-heading leading-snug">
            {lecture.title}
          </h4>
          <p className="mt-3 text-sm font-medium text-ink">{lecture.speaker}</p>
          <p className="text-xs text-ink-light">{lecture.speakerRole}</p>
          <p className="mt-3 text-xs text-ink-muted">{lecture.date}</p>
        </div>
      </div>
    </Card>
  );
}

export function ConferenceBrochureView({
  brochure,
}: {
  brochure: ConferenceBrochure;
}) {
  const { concept, questions, objectives, subThemes, subThemesIntro } = brochure;
  const { speakers, lectures, committee, organizers } = brochure;
  const themesHaveTopics = subThemes.some(({ topics }) => topics.length > 0);

  return (
    <>
      <Section title="Concept Note">
        <div className="space-y-4 text-ink-light leading-relaxed">
          {concept.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {questions && (
          <ol className="mt-4 list-[lower-alpha] pl-5 space-y-2 text-ink-light leading-relaxed">
            {questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        )}
        <p className="mt-4 text-sm text-ink-light">{organizers}</p>
      </Section>

      {objectives && (
        <Section title="Objectives">
          <ol className="list-decimal pl-5 space-y-2 text-ink-light leading-relaxed">
            {objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ol>
        </Section>
      )}

      <Section title="Conference Sub-Themes">
        {subThemesIntro && (
          <p className="mb-4 text-ink-light leading-relaxed">{subThemesIntro}</p>
        )}
        {themesHaveTopics ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {subThemes.map(({ title, topics }, index) => (
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
        ) : (
          <ol className="list-decimal pl-5 space-y-2 text-ink-light leading-relaxed">
            {subThemes.map(({ title }) => (
              <li key={title}>{title}</li>
            ))}
          </ol>
        )}
      </Section>

      {lectures && (
        <Section title="Special Lectures">
          <div className="grid gap-4">
            {lectures.map((lecture) => (
              <Lecture key={lecture.title} lecture={lecture} />
            ))}
          </div>
        </Section>
      )}

      {speakers && (
        <Section title="Plenary Speakers">
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {speakers.map(({ name, role }) => (
              <div key={name} className="border-b border-ink/5 pb-2">
                <dt className="text-sm font-semibold text-ink">{name}</dt>
                <dd className="text-xs text-ink-light">{role}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      <Section title="Organizing Committee">
        <dl className="space-y-4">
          {committee.map(({ role, members }) => (
            <div
              key={role}
              className="grid gap-1 sm:grid-cols-[220px_1fr] border-b border-ink/5 pb-3"
            >
              <dt className="text-sm font-semibold text-brand-dark-teal">{role}</dt>
              <dd className="text-sm text-ink-light space-y-1">
                {members.map((member) => (
                  <p key={member}>{member}</p>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
