import { NextResponse } from "next/server";
import { submitIndexNow } from "@/lib/indexnow";
import { absoluteUrl } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * POST /api/indexnow
 * Body: { urls: string[] } — absolute or site-relative paths
 * Auth: Authorization: Bearer $CRON_SECRET (or INDEXNOW_SUBMIT_SECRET)
 */
export async function POST(request: Request) {
  const secret =
    process.env.INDEXNOW_SUBMIT_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!secret || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { urls?: unknown };
  try {
    body = (await request.json()) as { urls?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.urls) || body.urls.length === 0) {
    return NextResponse.json(
      { error: "urls must be a non-empty string array" },
      { status: 400 },
    );
  }

  const urls = body.urls
    .filter((u): u is string => typeof u === "string" && u.length > 0)
    .map((u) => (u.startsWith("http") ? u : absoluteUrl(u)));

  if (urls.length === 0 || urls.length > 10000) {
    return NextResponse.json(
      { error: "Provide 1–10000 valid URLs" },
      { status: 400 },
    );
  }

  const result = await submitIndexNow(urls);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
