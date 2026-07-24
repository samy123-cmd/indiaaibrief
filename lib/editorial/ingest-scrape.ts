import "server-only";

import * as cheerio from "cheerio";
import {
  getActiveSources,
  insertSignalFromItem,
  markSourceFetch,
  type IngestItem,
  type IngestResult,
} from "@/lib/editorial/ingest-shared";
import type { FetchFrequency } from "@/lib/editorial/types";

interface ScrapeSelectors {
  item?: string;
  title?: string;
  link?: string;
  summary?: string;
  date?: string;
  content?: string;
}

interface ScrapeConfig {
  selectors?: ScrapeSelectors;
  baseUrl?: string;
  maxItems?: number;
  indiaFilter?: boolean;
}

const FETCH_HEADERS = {
  "User-Agent": "IndiaAIBriefBot/1.0 (+https://indiaaibrief.com)",
  Accept: "text/html,application/xhtml+xml",
};

function absolutize(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

async function scrapeSourcePage(
  pageUrl: string,
  config: ScrapeConfig,
): Promise<IngestItem[]> {
  const res = await fetch(pageUrl, {
    headers: FETCH_HEADERS,
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${pageUrl}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const selectors = config.selectors ?? {};
  const itemSel = selectors.item ?? "article, .post, .news-item, li";
  const titleSel = selectors.title ?? "h1, h2, h3, a";
  const linkSel = selectors.link ?? "a";
  const summarySel = selectors.summary ?? "p";
  const maxItems = config.maxItems ?? 15;
  const base = config.baseUrl ?? pageUrl;

  const items: IngestItem[] = [];

  $(itemSel).each((_, el) => {
    if (items.length >= maxItems) return;

    const node = $(el);
    const title =
      node.find(titleSel).first().text().trim() ||
      node.find("a").first().text().trim();
    const href =
      node.find(linkSel).first().attr("href") ||
      node.find("a").first().attr("href");
    const summary = node.find(summarySel).first().text().trim();

    if (!title || !href) return;

    const sourceUrl = absolutize(href, base);
    const blob = `${title} ${summary}`.toLowerCase();

    if (
      config.indiaFilter &&
      !/\b(india|indian|bharat|meity|delhi|mumbai|bangalore|bengaluru|hyderabad)\b/i.test(
        blob,
      )
    ) {
      return;
    }

    items.push({
      title: title.slice(0, 500),
      sourceUrl,
      summary: summary.slice(0, 2000),
      rawContent: summary.slice(0, 10000),
      publishedAt: null,
    });
  });

  return items;
}

export async function ingestScrapeSources(opts?: {
  frequencies?: FetchFrequency[];
}): Promise<{ results: IngestResult[]; totalInserted: number }> {
  const sources = await getActiveSources({
    type: "scrape",
    frequencies: opts?.frequencies,
  });

  const results: IngestResult[] = [];
  let totalInserted = 0;

  for (const source of sources) {
    const result: IngestResult = {
      sourceId: source.id,
      sourceName: source.name,
      fetched: 0,
      inserted: 0,
      skipped: 0,
    };

    try {
      const config = (source.config ?? {}) as ScrapeConfig;
      const items = await scrapeSourcePage(source.url, config);
      result.fetched = items.length;

      for (const item of items) {
        const outcome = await insertSignalFromItem(item, {
          sourceName: source.name,
          sourceType: "scrape",
        });
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
        error instanceof Error ? error.message : "Unknown scrape error";
      await markSourceFetch(source.id, "error", result.error);
    }

    results.push(result);
  }

  return { results, totalInserted };
}

export async function testScrapeSource(
  pageUrl: string,
  config: ScrapeConfig = {},
): Promise<IngestItem | null> {
  const items = await scrapeSourcePage(pageUrl, {
    ...config,
    maxItems: 1,
  });
  return items[0] ?? null;
}
