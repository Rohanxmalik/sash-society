import { Container } from "@/frontend/components/ui/container";
import { PageHero } from "@/frontend/components/ui/page-hero";
import { LEGAL_UPDATED_ON, type LegalDocument } from "@/frontend/content/legal";

export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <>
      <PageHero title={document.title} subtitle={document.description} />

      <section className="py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl space-y-10">
            {document.sections.map(({ heading, paragraphs }) => (
              <div key={heading}>
                <h2 className="text-xl font-black text-ink font-heading">
                  {heading}
                </h2>
                {paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-ink-light leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}

            <p className="text-sm text-ink-muted">
              Last updated on {LEGAL_UPDATED_ON}.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
