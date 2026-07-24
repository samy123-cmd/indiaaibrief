/**
 * Apply all SQL migrations in drizzle/migrations against DATABASE_URL.
 *
 *   npx tsx scripts/migrate-editorial.ts
 */
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { parseDatabaseUrl } from "../lib/db-url";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");

  const dir = path.join(process.cwd(), "drizzle", "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    // Skip legacy unprefixed migrations that collide with Global AI News tables
    .filter((f) => !f.startsWith("0000_") && !f.startsWith("0001_"))
    .sort();

  const cfg = parseDatabaseUrl(connectionString);
  console.log(`Connecting as ${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database}`);

  const client = postgres({
    host: cfg.host,
    port: cfg.port,
    database: cfg.database,
    user: cfg.user,
    password: cfg.password,
    ssl: "require",
    prepare: false,
    max: 1,
  });

  for (const file of files) {
    const sqlPath = path.join(dir, file);
    const sqlText = fs.readFileSync(sqlPath, "utf8");
    console.log(`Applying ${file}…`);
    await client.unsafe(sqlText);
  }

  console.log(`Applied ${files.length} migration(s).`);
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
