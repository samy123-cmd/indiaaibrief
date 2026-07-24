import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/drizzle/schema";
import { parseDatabaseUrl } from "@/lib/db-url";

type Db = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  // Persist across hot reloads in dev; one pool per process in prod/build workers.
  // eslint-disable-next-line no-var
  var __iabSql: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var __iabDb: Db | undefined;
}

/** True while `next build` is prerendering — avoid opening dozens of DB pools. */
export function isProductionBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (globalThis.__iabSql) {
    return globalThis.__iabSql;
  }

  const cfg = parseDatabaseUrl(connectionString);
  // Session-mode poolers (Supabase/Neon) often cap ~15 clients. Next build
  // runs many workers — keep max at 1 per process so we don't EMAXCONNSESSION.
  const client = postgres({
    host: cfg.host,
    port: cfg.port,
    database: cfg.database,
    user: cfg.user,
    password: cfg.password,
    ssl: "require",
    prepare: false,
    max: 1,
    idle_timeout: 20,
    max_lifetime: 60 * 5,
  });

  globalThis.__iabSql = client;
  return client;
}

export function getDb(): Db {
  if (globalThis.__iabDb) {
    return globalThis.__iabDb;
  }
  const instance = drizzle(getSql(), { schema });
  globalThis.__iabDb = instance;
  return instance;
}

export async function pingDatabase(): Promise<boolean> {
  try {
    const sql = getSql();
    const rows = await sql`select 1 as ok`;
    return rows[0]?.ok === 1;
  } catch {
    return false;
  }
}

export { schema };
