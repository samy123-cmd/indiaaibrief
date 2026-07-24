import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import postgres from "postgres";
import { parseDatabaseUrl } from "../lib/db-url";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const cfg = parseDatabaseUrl(process.env.DATABASE_URL!);
  const sql = postgres({
    host: cfg.host,
    port: cfg.port,
    database: cfg.database,
    user: cfg.user,
    password: cfg.password,
    ssl: "require",
    prepare: false,
    max: 1,
  });

  const tables = await sql`
    select table_name from information_schema.tables
    where table_schema = 'public'
    order by 1
  `;

  const eqCols = await sql`
    select column_name, data_type from information_schema.columns
    where table_schema = 'public' and table_name = 'editorial_queue'
    order by ordinal_position
  `;

  const ourTables = [
    "sources",
    "signals",
    "editorial_queue",
    "audit_logs",
    "articles",
    "figures",
    "profiles",
  ];
  const existing = tables.map((t) => t.table_name as string);
  const report = {
    allTables: existing,
    ourOverlap: ourTables.filter((t) => existing.includes(t)),
    editorial_queue: eqCols,
  };
  fs.writeFileSync(
    path.join(process.cwd(), "tmp-db-inspect.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
