import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/drizzle/schema";
import { parseDatabaseUrl } from "@/lib/db-url";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let client: ReturnType<typeof postgres> | null = null;
let db: Db | null = null;

export function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!client) {
    const cfg = parseDatabaseUrl(connectionString);
    client = postgres({
      host: cfg.host,
      port: cfg.port,
      database: cfg.database,
      user: cfg.user,
      password: cfg.password,
      ssl: "require",
      prepare: false,
      max: 10,
    });
  }

  return client;
}

export function getDb(): Db {
  if (!db) {
    db = drizzle(getSql(), { schema });
  }
  return db;
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
