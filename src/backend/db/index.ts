import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getEnv } from "@/backend/env";
import { safeLogValue } from "@/backend/safe-log";
import * as schema from "./schema";
import type { Db } from "./types";

const POOL_SIZE = 10;

// Kept on globalThis so hot reload does not open a new pool on every edit.
const store = globalThis as typeof globalThis & { sashDb?: Db };

function connect(): Db {
  const pool = new Pool({
    connectionString: getEnv().DATABASE_URL,
    max: POOL_SIZE,
  });
  // Without a listener, an idle connection dropping would crash the process.
  pool.on("error", (error) => {
    console.error("Postgres pool error", safeLogValue(error));
  });
  return drizzle(pool, { schema });
}

export function getDb(): Db {
  store.sashDb ??= connect();
  return store.sashDb;
}
