/**
 * Parse DATABASE_URL safely.
 * Node's URL parser mishandles postgresql:// usernames that contain dots
 * (e.g. postgres.projectref) — rewrite to http: for parsing only.
 */
export function parseDatabaseUrl(connectionString: string): {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
} {
  // Guard against accidental "DATABASE_URL=postgresql://..." pasted as the value
  let raw = connectionString.trim().replace(/^DATABASE_URL=/i, "");
  const normalized = raw.replace(/^postgresql:/i, "http:");
  const parsed = new URL(normalized);

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    database: parsed.pathname.replace(/^\//, "") || "postgres",
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
  };
}
