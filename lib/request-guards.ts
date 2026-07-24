/**
 * Only allow same-origin relative paths (blocks //evil.com and absolute URLs).
 */
export function safeRedirectPath(
  raw: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!raw) return fallback;
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return fallback;
  }
  return path;
}

/** True when Origin/Referer matches our public site (or local/preview hosts). */
export function isTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const allowed = new Set<string>();

  if (site) {
    try {
      allowed.add(new URL(site).origin);
    } catch {
      /* ignore */
    }
  }
  allowed.add("https://www.indiaaibrief.com");
  allowed.add("https://indiaaibrief.com");
  allowed.add("http://localhost:3000");
  allowed.add("http://127.0.0.1:3000");

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    allowed.add(`https://${vercelUrl}`);
  }

  if (origin) {
    return allowed.has(origin);
  }
  if (referer) {
    try {
      return allowed.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }
  // Same-origin navigations sometimes omit Origin; allow when no Origin/Referer
  // only in development.
  return process.env.NODE_ENV !== "production";
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
