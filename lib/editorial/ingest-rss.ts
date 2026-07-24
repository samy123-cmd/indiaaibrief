import "server-only";

import Parser from "rss-parser";
import {
  getActiveSources,
  insertSignalFromItem,
  markSourceFetch,
  type IngestResult,
} from "@/lib/editorial/ingest-shared";
import type { FetchFrequency } from "@/lib/editorial/types";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "IndiaAIBriefBot/1.0 (+https://www.indiaaibrief.com)",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

function feedUrlFromConfig(
  url: string,
  config: Record<string, unknown>,
): string {
  if (typeof config.feedUrl === "string" && config.feedUrl.length > 0) {
    return config.feedUrl;
  }
  return url;
}

export async function ingestRssFeeds(opts?: {
  frequencies?: FetchFrequency[];
  limitPerSource?: number;
}): Promise<{ results: IngestResult[]; totalInserted: number }> {
  const sources = await getActiveSources({
    type: "rss",
    frequencies: opts?.frequencies,
  });

  const results: IngestResult[] = [];
  let totalInserted = 0;
  const limit = opts?.limitPerSource ?? 25;

  for (const source of sources) {
    const result: IngestResult = {
      sourceId: source.id,
      sourceName: source.name,
      fetched: 0,
      inserted: 0,
      skipped: 0,
    };

    try {
      const config = (source.config ?? {}) as Record<string, unknown>;
      const feedUrl = feedUrlFromConfig(source.url, config);
      const feed = await parser.parseURL(feedUrl);
      const items = (feed.items ?? []).slice(0, limit);
      result.fetched = items.length;

      for (const item of items) {
        const link = item.link?.trim();
        const title = item.title?.trim();
        if (!link || !title) {
          result.skipped += 1;
          continue;
        }

        const summary =
          item.contentSnippet?.trim() ||
          item.summary?.trim() ||
          item.content?.replace(/<[^>]+>/g, " ").trim() ||
          "";

        const outcome = await insertSignalFromItem(
          {
            title,
            sourceUrl: link,
            summary: summary.slice(0, 2000),
            rawContent: (item.content ?? summary).slice(0, 20000),
            publishedAt: item.pubDate ? new Date(item.pubDate) : null,
          },
          { sourceName: source.name, sourceType: "rss" },
        );

        if (outcome === "inserted") {
          result.inserted += 1;
          totalInserted += 1;
        } else {
          result.skipped += 1;
        }
      }

      await markSourceFetch(source.id, "success");
    } catch (error) {
      result.error =
        error instanceof Error ? error.message : "Unknown RSS fetch error";
      await markSourceFetch(source.id, "error", result.error);
    }

    results.push(result);
  }

  return { results, totalInserted };
}

export async function testRssSource(feedUrl: string): Promise<{
  title: string;
  link: string;
  summary: string;
  pubDate?: string;
} | null> {
  const feed = await parser.parseURL(feedUrl);
  const item = feed.items?.[0];
  if (!item?.title || !item?.link) return null;

  return {
    title: item.title,
    link: item.link,
    summary:
      item.contentSnippet?.trim() ||
      item.summary?.trim() ||
      item.content?.replace(/<[^>]+>/g, " ").trim().slice(0, 500) ||
      "",
    pubDate: item.pubDate,
  };
}
