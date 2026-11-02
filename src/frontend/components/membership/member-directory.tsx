"use client";

import { useState } from "react";
import { Search } from "lucide-react";

type DirectoryEntry = { fullName: string; designation: string };

const matches = (entry: DirectoryEntry, query: string) =>
  `${entry.fullName} ${entry.designation}`.toLowerCase().includes(query);

export function MemberDirectory({ members }: { members: DirectoryEntry[] }) {
  const [query, setQuery] = useState("");
  const visible = members.filter((entry) =>
    matches(entry, query.trim().toLowerCase())
  );

  return (
    <>
      <div className="max-w-md mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search members..."
            aria-label="Search members"
            className="w-full border border-ink/20 rounded-sm pl-12 pr-4 py-3 text-sm bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors"
          />
        </div>
      </div>

      {visible.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((entry, index) => (
            <li
              key={`${entry.fullName}-${index}`}
              className="bg-white border border-ink/10 rounded-sm p-5"
            >
              <p className="font-bold text-ink font-heading">{entry.fullName}</p>
              <p className="mt-1 text-sm text-ink-light">{entry.designation}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-ink-light">No members found.</p>
      )}
    </>
  );
}
