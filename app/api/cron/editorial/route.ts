import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { signals } from "@/drizzle/schema";
import {
  authErrorResponse,
  requireCronAuth,
} from "@/lib/editorial/auth";
import { generateArticleDraft } from "@/lib/editorial/draft";
import { ingestRssFeeds } from "@/lib/editorial/ingest-rss";
import { ingestScrapeSources } from "@/lib/editorial/ingest-scrape";
import { reclassifyNewSignals } from "@/lib/editorial/ingest-shared";
import { getDb } from "@/lib/db";

type CronJob =
  | "rss-high"
  | "rss-medium"
  | "scrape"
  | "morning-brief"
  | "weekly-roundup";

function resolveJob(request: Request): CronJob {
  const url = new URL(request.url);
  const jobParam = url.searchParams.get("job") as CronJob | null;
  if (jobParam) return jobParam;

  const schedule = request.headers.get("x-vercel-cron-schedule");
  switch (schedule) {
    case "*/15 * * * *":
      return "rss-high";
    case "0 * * * *":
      return "rss-medium";
    case "0 */6 * * *":
      return "scrape";
    case "30 2 * * *":
      return "morning-brief";
    case "30 12 * * 0":
      return "weekly-roundup";
    default:
      return "rss-medium";
  }
}

async function runMorningBrief() {
  const db = getDb();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const top = await db
    .select()
    .from(signals)
    .where(
      and(
        gte(signals.fetchedAt, since),
        inArray(signals.impactLevel, ["critical", "high"]),
        inArray(signals.status, ["new", "reviewing", "approved"]),
      ),
    )
    .orderBy(desc(signals.fetchedAt))
    .limit(3);

  const drafts = [];
  for (const signal of top) {
    const draft = await generateArticleDraft(signal);
    await db
      .update(signals)
      .set({
        aiDraft: draft,
        aiDraftGeneratedAt: new Date(),
        status: "drafting",
        updatedAt: new Date(),
      })
      .where(eq(signals.id, signal.id));
    drafts.push({ id: signal.id, title: signal.title });
  }

  return { count: drafts.length, drafts };
}

async function runWeeklyRoundup() {
  const db = getDb();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const published = await db
    .select()
    .from(signals)
    .where(
      and(eq(signals.status, "published"), gte(signals.updatedAt, since)),
    )
    .orderBy(desc(signals.updatedAt))
    .limit(20);

  const body = [
    "Weekly India AI Roundup",
    "",
    ...published.map((s) => `- ${s.title} (${s.category}, ${s.impactLevel})`),
  ].join("\n");

  let buttondownId: string | null = null;
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  const apiUrl =
    process.env.BUTTONDOWN_API_URL ?? "https://api.buttondown.email/v1";

  if (apiKey && published.length > 0) {
    try {
      const res = await fetch(`${apiUrl}/emails`, {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: `The Brief: Week in Indian AI (${new Date().toISOString().slice(0, 10)})`,
          body,
          status: "draft",
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id?: string };
        buttondownId = data.id ?? null;
      }
    } catch (error) {
      console.error("[cron] Buttondown draft failed:", error);
    }
  }

  return {
    publishedCount: published.length,
    buttondownId,
    preview: body.slice(0, 500),
  };
}

async function runEditorDigest() {
  const db = getDb();
  const top = await db
    .select()
    .from(signals)
    .where(inArray(signals.status, ["new", "reviewing"]))
    .orderBy(desc(signals.fetchedAt))
    .limit(10);

  return {
    unreviewed: top.map((s) => ({
      id: s.id,
      title: s.title,
      impactLevel: s.impactLevel,
      indiaRelevance: s.indiaRelevance,
      source: s.source,
    })),
  };
}

export async function GET(request: Request) {
  try {
    requireCronAuth(request as import("next/server").NextRequest);
    const job = resolveJob(request);

    switch (job) {
      case "rss-high": {
        const result = await ingestRssFeeds({
          frequencies: ["5min", "15min"],
        });
        return Response.json({ job, ...result });
      }
      case "rss-medium": {
        const result = await ingestRssFeeds({
          frequencies: ["1hour", "6hours"],
        });
        const reclassified = await reclassifyNewSignals();
        return Response.json({
          job,
          totalInserted: result.totalInserted,
          results: result.results,
          reclassified,
        });
      }
      case "scrape": {
        const result = await ingestScrapeSources({
          frequencies: ["6hours", "daily"],
        });
        const digest = await runEditorDigest();
        return Response.json({ job, ...result, digest });
      }
      case "morning-brief": {
        const brief = await runMorningBrief();
        return Response.json({ job, ...brief });
      }
      case "weekly-roundup": {
        const roundup = await runWeeklyRoundup();
        return Response.json({ job, ...roundup });
      }
      default:
        return Response.json({ error: "Unknown job" }, { status: 400 });
    }
  } catch (error) {
    return authErrorResponse(error);
  }
}
