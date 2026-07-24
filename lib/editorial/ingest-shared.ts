import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { editorialQueue, signals, sources, type NewSignal } from "@/drizzle/schema";
import { classifyIndiaRelevance } from "@/lib/editorial/classify";
import {
  calculateDeadline,
  calculatePriority,
} from "@/lib/editorial/priority";
import type { FetchFrequency, SignalSourceType } from "@/lib/editorial/types";
import { getDb } from "@/lib/db";

export interface IngestItem {
  title: string;
  sourceUrl: string;
  summary?: string;
  rawContent?: string;
  publishedAt?: Date | null;
}

export interface IngestResult {
  sourceId: string;
  sourceName: string;
  fetched: number;
  inserted: number;
  skipped: number;
  error?: string;
}

function slugSourceName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80);
}

export async function insertSignalFromItem(
  item: IngestItem,
  opts: {
    sourceName: string;
    sourceType: SignalSourceType;
  },
): Promise<"inserted" | "skipped"> {
  const db = getDb();

  const existing = await db
    .select({ id: signals.id })
    .from(signals)
    .where(eq(signals.sourceUrl, item.sourceUrl))
    .limit(1);

  if (existing.length > 0) return "skipped";

  const classified = classifyIndiaRelevance({
    title: item.title,
    summary: item.summary,
    rawContent: item.rawContent,
    source: opts.sourceName,
  });

  const row: NewSignal = {
    title: item.title.slice(0, 500),
    source: slugSourceName(opts.sourceName),
    sourceUrl: item.sourceUrl,
    sourceType: opts.sourceType,
    category: classified.category,
    impactLevel: classified.impactLevel,
    indiaRelevance: classified.indiaRelevance,
    summary: (item.summary ?? "").slice(0, 5000),
    rawContent: (item.rawContent ?? item.summary ?? "").slice(0, 50000),
    publishedAt: item.publishedAt ?? null,
    fetchedAt: new Date(),
    status: "new",
    tags: classified.tags,
    relatedStartups: classified.relatedStartups,
    relatedPolicies: classified.relatedPolicies,
  };

  const [inserted] = await db.insert(signals).values(row).returning();
  if (!inserted) return "skipped";

  if (
    classified.indiaRelevance === "direct" &&
    classified.impactLevel === "critical"
  ) {
    await db
      .insert(editorialQueue)
      .values({
        signalId: inserted.id,
          priority: calculatePriority(
            classified.impactLevel,
            classified.indiaRelevance,
          ),
          deadline: calculateDeadline(classified.impactLevel),
          notes: "Auto-flagged: direct + critical",
        })
        .onConflictDoNothing({ target: editorialQueue.signalId });
  }

  return "inserted";
}

export async function markSourceFetch(
  sourceId: string,
  status: "success" | "error",
  error?: string,
): Promise<void> {
  const db = getDb();
  await db
    .update(sources)
    .set({
      lastFetchedAt: new Date(),
      lastFetchStatus: status,
      lastFetchError: error ?? null,
      updatedAt: new Date(),
    })
    .where(eq(sources.id, sourceId));
}

export async function getActiveSources(opts?: {
  type?: "rss" | "scrape" | "api" | "webhook" | "manual";
  frequencies?: FetchFrequency[];
}) {
  const db = getDb();
  const conditions = [eq(sources.isActive, true)];

  if (opts?.type) {
    conditions.push(eq(sources.type, opts.type));
  }

  const rows = await db
    .select()
    .from(sources)
    .where(and(...conditions));

  if (opts?.frequencies?.length) {
    return rows.filter((s) =>
      opts.frequencies!.includes(s.fetchFrequency as FetchFrequency),
    );
  }

  return rows;
}

export async function reclassifyNewSignals(limit = 100): Promise<number> {
  const db = getDb();
  const rows = await db
    .select()
    .from(signals)
    .where(inArray(signals.status, ["new", "reviewing"]))
    .limit(limit);

  let updated = 0;
  for (const row of rows) {
    const classified = classifyIndiaRelevance({
      title: row.title,
      summary: row.summary,
      rawContent: row.rawContent,
      source: row.source,
    });

    await db
      .update(signals)
      .set({
        category: classified.category,
        impactLevel: classified.impactLevel,
        indiaRelevance: classified.indiaRelevance,
        relatedStartups: classified.relatedStartups,
        relatedPolicies: classified.relatedPolicies,
        tags: classified.tags,
        updatedAt: new Date(),
      })
      .where(eq(signals.id, row.id));

    if (
      classified.indiaRelevance === "direct" &&
      classified.impactLevel === "critical"
    ) {
      await db
        .insert(editorialQueue)
        .values({
          signalId: row.id,
          priority: calculatePriority(
            classified.impactLevel,
            classified.indiaRelevance,
          ),
          deadline: calculateDeadline(classified.impactLevel),
          notes: "Auto-flagged after reclassify",
        })
        .onConflictDoNothing({ target: editorialQueue.signalId });
    }

    updated += 1;
  }

  return updated;
}
