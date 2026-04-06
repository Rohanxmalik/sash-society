import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Constitution",
  description: "Constitution of the South Asian Sociological Society (SASS), registered under India's Societies Registration Act, 1860.",
};

export default function ConstitutionPage() {
  return (
    <>
      <PageHero
        title="Constitution"
        subtitle="Registered under India's Societies Registration Act, 1860 (Registration Number: Chhatrapati/0000621/2025)"
      />

      <section className="py-24 lg:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[250px_1fr]">
            {/* Sidebar TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold-dark mb-4">
                  Contents
                </h3>
                <nav className="space-y-2">
                  {[
                    "Purpose",
                    "Objectives",
                    "Membership",
                    "Governance",
                    "Publications",
                    "Conferences",
                    "Amendments",
                  ].map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="block text-sm text-ink-light hover:text-brand-dark-teal transition-colors py-1"
                    >
                      {item}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <section id="purpose">
                <h2 className="text-2xl font-black text-ink font-heading border-b border-ink/10 pb-4 mb-6">
                  Purpose
                </h2>
                <p className="text-ink-light leading-relaxed">
                  The South Asian Sociological Society functions as a non-profit
                  professional association for scientific purposes, representing
                  academicians and sociologists globally, irrespective of their
                  methodological approaches or theoretical perspectives.
                </p>
              </section>

              <section id="objectives" className="mt-12">
                <h2 className="text-2xl font-black text-ink font-heading border-b border-ink/10 pb-4 mb-6">
                  Objectives
                </h2>
                <ol className="space-y-4 text-ink-light leading-relaxed list-decimal pl-6">
                  <li>
                    <strong>Knowledge Advancement:</strong> Advance scientific and
                    sociological knowledge throughout the world.
                  </li>
                  <li>
                    <strong>Institutional Development:</strong> Foster connections
                    between sociologists and social scientists across South Asia.
                  </li>
                  <li>
                    <strong>Information Exchange:</strong> Encourage the
                    international dissemination and exchange of information
                    regarding sociological developments.
                  </li>
                  <li>
                    <strong>Research Support:</strong> Facilitate and promote
                    international research and training initiatives.
                  </li>
                  <li>
                    <strong>Scientific Study:</strong> Pursue investigation of
                    societal and scientific matters.
                  </li>
                  <li>
                    <strong>Knowledge Dissemination:</strong> Spread understanding
                    through lectures, publications, and related methods.
                  </li>
                  <li>
                    <strong>Publications:</strong> Issue minimum two annual
                    publications including the Journal of SASS, E-Journal, and
                    E-Newsletter, plus additional materials.
                  </li>
                  <li>
                    <strong>Academic Events:</strong> Conduct conferences, organize
                    Research Committee meetings, and host Memorial Lectures.
                  </li>
                </ol>
              </section>

              <section id="membership" className="mt-12">
                <h2 className="text-2xl font-black text-ink font-heading border-b border-ink/10 pb-4 mb-6">
                  Membership
                </h2>
                <p className="text-ink-light leading-relaxed">
                  SASS offers multiple membership categories including Life
                  Membership (India, South Asia, and Abroad), Individual
                  Membership, Ordinary Membership, Student Membership,
                  Institutional Membership, and Social Science Societies /
                  Regional Associations. Each category has specific eligibility
                  criteria and benefits as outlined in the membership section.
                </p>
              </section>

              <section id="governance" className="mt-12">
                <h2 className="text-2xl font-black text-ink font-heading border-b border-ink/10 pb-4 mb-6">
                  Governance
                </h2>
                <p className="text-ink-light leading-relaxed">
                  The organization operates under an Advisory Board, International
                  Committee, National Committee, and Regional Committees. The
                  Managing Committee is responsible for organizational oversight
                  and policy formulation, with decisions requiring appropriate
                  committee approval.
                </p>
              </section>

              <section id="publications" className="mt-12">
                <h2 className="text-2xl font-black text-ink font-heading border-b border-ink/10 pb-4 mb-6">
                  Publications
                </h2>
                <p className="text-ink-light leading-relaxed">
                  The Society shall issue a minimum of two annual publications
                  including the Journal of the South Asian Sociological Society,
                  E-Journal, and E-Newsletter. Additional publications including
                  brochures, books, and conference proceedings may be produced as
                  determined by the Managing Committee.
                </p>
              </section>

              <section id="conferences" className="mt-12">
                <h2 className="text-2xl font-black text-ink font-heading border-b border-ink/10 pb-4 mb-6">
                  Conferences
                </h2>
                <p className="text-ink-light leading-relaxed">
                  SASS organizes regular international conferences, Research
                  Committee meetings, and Memorial Lectures. Conference themes and
                  academic leadership are directed by the SASS President, with
                  host institution requirements outlined in the Conference
                  Guidelines.
                </p>
              </section>

              <section id="amendments" className="mt-12">
                <h2 className="text-2xl font-black text-ink font-heading border-b border-ink/10 pb-4 mb-6">
                  Amendments
                </h2>
                <p className="text-ink-light leading-relaxed">
                  This constitution was amended in January 2025. Future amendments
                  require approval by the Managing Committee and must be
                  periodically reviewed to ensure alignment with the Society&apos;s
                  evolving objectives and regulatory requirements.
                </p>
              </section>

              <div className="mt-12 p-6 bg-cream-dark rounded-sm">
                <p className="text-sm text-ink-muted">
                  For the complete constitution document including all articles,
                  by-laws, and appendices, please contact the SASS office or
                  email{" "}
                  <a
                    href="mailto:southasiansociety2@gmail.com"
                    className="text-brand-dark-teal hover:underline"
                  >
                    southasiansociety2@gmail.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
