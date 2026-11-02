// Called every 10 minutes by cron-job.org, because Render's Free plan sleeps after
// 15 idle minutes. Render also polls this path as its health check. Stay away from
// the database here: regular queries would keep Neon awake and use up its free
// compute, and the database is then suspended until the next month.
export function GET() {
  return Response.json(
    { status: "ok" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
