import dotenv from "dotenv";
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

  const wanted = [
    "sources",
    "signals",
    "editorial_queue",
    "audit_logs",
    "articles",
    "figures",
    "profiles",
    "iab_sources",
    "iab_signals",
    "iab_editorial_queue",
    "iab_audit_logs",
    "iab_articles",
    "iab_figures",
  ];

  for (const name of wanted) {
    const rows = await sql`
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = ${name}
    `;
    console.log(`${name}: ${rows.length ? "EXISTS" : "missing"}`);
  }

  const enums = await sql`
    select typname from pg_type
    where typname like '%source%' or typname like '%signal%' or typname like '%impact%'
       or typname like '%india%' or typname like '%fetch%' or typname like '%article%'
       or typname like '%content_category%' or typname like 'iab_%'
    order by 1
  `;
  console.log(
    "enums:",
    enums.map((e) => e.typname).join(", ") || "(none matched)",
  );

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
