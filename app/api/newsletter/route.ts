import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeToNewsletter } from "@/lib/buttondown";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, isTrustedOrigin } from "@/lib/request-guards";

const ALLOWED_TAGS = new Set([
  "website",
  "homepage",
  "footer",
  "sticky",
  "article",
  "newsletter",
  "subscribe",
  "kit",
  "audit",
  "playbooks",
  "explains",
  "compares",
  "news",
  "data",
  "startups",
  "policy",
]);

const bodySchema = z.object({
  email: z.string().trim().email().max(254),
  tags: z.array(z.string().max(64)).max(8).optional(),
  /** Honeypot — bots fill this; humans leave empty */
  company_url: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  try {
    if (!isTrustedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = clientIp(request);
    const limited = rateLimit({
      key: `newsletter:${ip}`,
      limit: 8,
      windowMs: 60 * 60 * 1000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many signup attempts. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const json: unknown = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Honeypot filled → pretend success (bots)
    if (parsed.data.company_url && parsed.data.company_url.trim()) {
      return NextResponse.json({ ok: true, id: "ok" });
    }

    const tags = (parsed.data.tags ?? ["website"])
      .map((t) => t.trim().toLowerCase())
      .filter((t) => ALLOWED_TAGS.has(t))
      .slice(0, 5);
    if (tags.length === 0) tags.push("website");

    const subscriber = await subscribeToNewsletter({
      email: parsed.data.email,
      tags,
      ipAddress: ip === "unknown" ? undefined : ip,
    });

    return NextResponse.json({ ok: true, id: subscriber.id });
  } catch (error) {
    console.error("[newsletter]", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    const message =
      error instanceof Error
        ? sanitizeNewsletterError(error.message)
        : "Newsletter subscription failed. Try again or email hello@indiaaibrief.com.";
    const status = /rate.?limit|too many/i.test(message)
      ? 429
      : /blocked|spam filter|valid email/i.test(message)
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

function sanitizeNewsletterError(raw: string): string {
  if (/rate.?limit|429/i.test(raw)) {
    return "Newsletter is rate-limited right now. Try again in a few minutes.";
  }
  if (/api key|401|403|invalid/i.test(raw)) {
    return "Newsletter is temporarily unavailable. Email hello@indiaaibrief.com to join.";
  }
  if (/blocked|firewall|disposable/i.test(raw)) {
    return "That email was blocked by the spam filter. Use a real inbox, or email hello@indiaaibrief.com.";
  }
  if (/temporarily unavailable|BUTTONDOWN/i.test(raw)) {
    return "Newsletter is temporarily unavailable. Email hello@indiaaibrief.com to join.";
  }
  // Never leak upstream JSON/HTML to the client
  return "Could not subscribe right now. Try again or email hello@indiaaibrief.com.";
}
