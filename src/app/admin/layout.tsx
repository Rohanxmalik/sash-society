import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/frontend/components/ui/container";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

const ADMIN_LINKS = [
  { label: "Overview", href: "/admin" },
  { label: "Members", href: "/admin/members" },
  { label: "Events", href: "/admin/events" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Import", href: "/admin/import" },
];

// Holds no data. Every admin page and action checks requireAdmin() itself,
// because a layout does not re-run when moving between pages.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="py-10 lg:py-14">
      <Container>
        <nav
          aria-label="Admin"
          className="flex flex-wrap gap-x-6 gap-y-2 border-b border-ink/10 pb-4"
        >
          {ADMIN_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-semibold text-ink-light hover:text-brand-dark-teal transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-8">{children}</div>
      </Container>
    </section>
  );
}
