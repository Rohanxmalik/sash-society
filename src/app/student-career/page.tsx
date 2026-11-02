"use client";

import { useState } from "react";
import { PageHero } from "@/frontend/components/ui/page-hero";
import { Container } from "@/frontend/components/ui/container";
import { Card } from "@/frontend/components/ui/card";
import { ExternalLink } from "lucide-react";
import {
  scholarships,
  fellowships,
  internships,
  volunteerOpportunities,
} from "@/frontend/content/student-resources";
import type { ExternalResource } from "@/shared/types";

const tabs = [
  { id: "scholarships", label: "Scholarships & Grants", data: scholarships },
  { id: "fellowships", label: "Fellowships", data: fellowships },
  { id: "internships", label: "Jobs & Internships", data: internships },
  { id: "volunteer", label: "Volunteer", data: volunteerOpportunities },
];

function ResourceGrid({ resources }: { resources: ExternalResource[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <Card key={resource.name} className="p-6 flex flex-col">
          <h3 className="text-base font-bold text-ink font-heading">
            {resource.name}
          </h3>
          <p className="mt-2 text-sm text-ink-light leading-relaxed flex-1">
            {resource.description}
          </p>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-dark-teal hover:text-brand-teal transition-colors"
          >
            Visit
            <ExternalLink className="w-4 h-4" />
          </a>
        </Card>
      ))}
    </div>
  );
}

export default function StudentCareerPage() {
  const [activeTab, setActiveTab] = useState("scholarships");
  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <>
      <PageHero
        title="Student & Career"
        subtitle="Scholarships, fellowships, internships, and volunteer opportunities for social science students."
      />

      <section className="py-24 lg:py-32">
        <Container>
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-sm font-medium rounded-sm border transition-colors ${
                  activeTab === tab.id
                    ? "bg-ink text-white border-ink"
                    : "bg-white text-ink-light border-ink/20 hover:border-ink/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <ResourceGrid resources={currentTab.data} />
        </Container>
      </section>
    </>
  );
}
