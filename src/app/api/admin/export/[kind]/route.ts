import {
  membersCsv,
  paymentsCsv,
  registrationsCsv,
} from "@/backend/admin/reports";
import { requireAdmin } from "@/backend/auth/session";
import { getDb } from "@/backend/db";

const csvResponse = (csv: string, filename: string) =>
  new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "private, no-store",
    },
  });

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kind: string }> }
) {
  await requireAdmin();
  const { kind } = await params;
  const db = getDb();

  if (kind === "members") {
    return csvResponse(await membersCsv(db, new Date()), "sass-members.csv");
  }
  if (kind === "payments") {
    return csvResponse(await paymentsCsv(db), "sass-payments.csv");
  }
  if (kind === "registrations") {
    const eventId = new URL(request.url).searchParams.get("event") ?? "";
    return csvResponse(
      await registrationsCsv(db, eventId),
      "sass-event-registrations.csv"
    );
  }

  return new Response(null, { status: 404 });
}
