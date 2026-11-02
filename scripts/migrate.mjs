// Render runs this at the end of each build (npm run db:deploy), because its Free
// plan has no pre-deploy step. It uses only
// production dependencies, so drizzle-kit is not needed on the server.
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL, max: 1 });

try {
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  console.info("Database is up to date.");
} catch (error) {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
