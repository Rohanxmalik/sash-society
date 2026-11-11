"use client";

import { useState } from "react";
import { advisoryCommittee } from "@/frontend/content/committees/advisory";
import { internationalCommittee } from "@/frontend/content/committees/international";
import { managingCommittee } from "@/frontend/content/committees/managing";
import { nationalCommittee } from "@/frontend/content/committees/national";
import { regionalCommittee } from "@/frontend/content/committees/regional";
import { TeamCard } from "./team-card";

const tabs = [
  { id: "managing", label: "Managing", members: managingCommittee },
  { id: "advisory", label: "Advisory", members: advisoryCommittee },
  { id: "international", label: "International", members: internationalCommittee },
  { id: "national", label: "National", members: nationalCommittee },
  { id: "regional", label: "Regional", members: regionalCommittee },
];

export function CommitteeTabs() {
  const [activeId, setActiveId] = useState("managing");
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={tab.id === activeId}
            onClick={() => setActiveId(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-full border transition-all duration-300 ${
              tab.id === activeId
                ? "bg-brand-dark-teal text-white border-brand-dark-teal shadow-md"
                : "bg-white text-ink-light border-ink/15 hover:border-brand-dark-teal hover:text-brand-dark-teal hover:shadow-sm"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {active.members.map((member) => (
          <TeamCard key={member.name} member={member} />
        ))}
      </div>
    </>
  );
}
