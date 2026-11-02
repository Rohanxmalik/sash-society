import Link from "next/link";
import { registrationCount } from "@/backend/admin/reports";
import { requireAdmin } from "@/backend/auth/session";
import { getDb } from "@/backend/db";
import { AdminTable, Cell } from "@/frontend/components/admin/admin-table";
import { upcomingEvents } from "@/shared/events";

export default async function AdminEventsPage() {
  await requireAdmin();
  const db = getDb();

  const events = await Promise.all(
    upcomingEvents
      .filter((event) => event.registration)
      .map(async (event) => ({
        ...event,
        registered: await registrationCount(db, event.id),
      }))
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-ink font-heading">Events</h1>

      <AdminTable empty={events.length === 0} headers={["Event", "Date", "Registered"]}>
        {events.map((event) => (
          <tr key={event.id}>
            <Cell>
              <Link
                href={`/admin/events/${event.id}`}
                className="text-brand-teal hover:underline"
              >
                {event.shortTitle ?? event.title}
              </Link>
            </Cell>
            <Cell>{event.dateLabel ?? event.date}</Cell>
            <Cell>{event.registered}</Cell>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
