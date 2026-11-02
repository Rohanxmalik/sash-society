export function AdminTable({
  headers,
  empty,
  children,
}: {
  headers: string[];
  empty?: boolean;
  children: React.ReactNode;
}) {
  if (empty) {
    return <p className="text-sm text-ink-light py-6">Nothing to show yet.</p>;
  }

  return (
    <div className="overflow-x-auto border border-ink/10 rounded-sm bg-white">
      <table className="w-full text-sm">
        <thead className="bg-cream-dark/40 text-left">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-3 py-2.5 font-semibold text-ink whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5 text-ink-light">{children}</tbody>
      </table>
    </div>
  );
}

export function Cell({ children }: { children?: React.ReactNode }) {
  return <td className="px-3 py-2.5 align-top">{children ?? "-"}</td>;
}
