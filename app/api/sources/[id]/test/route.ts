import { eq } from "drizzle-orm";
import { sources } from "@/drizzle/schema";
import {
  authErrorResponse,
  requireEditor,
} from "@/lib/editorial/auth";
import { testRssSource } from "@/lib/editorial/ingest-rss";
import { testScrapeSource } from "@/lib/editorial/ingest-scrape";
import { getDb } from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    await requireEditor();
    const { id } = await context.params;
    const db = getDb();
    const [source] = await db
      .select()
      .from(sources)
      .where(eq(sources.id, id))
      .limit(1);

    if (!source) {
      return Response.json({ error: "Source not found" }, { status: 404 });
    }

    const config = (source.config ?? {}) as Record<string, unknown>;

    if (source.type === "rss") {
      const feedUrl =
        typeof config.feedUrl === "string" ? config.feedUrl : source.url;
      const preview = await testRssSource(feedUrl);
      return Response.json({ ok: true, type: "rss", preview });
    }

    if (source.type === "scrape") {
      const preview = await testScrapeSource(source.url, {
        selectors: config.selectors as
          | {
              item?: string;
              title?: string;
              link?: string;
              summary?: string;
            }
          | undefined,
        baseUrl:
          typeof config.baseUrl === "string" ? config.baseUrl : source.url,
        indiaFilter: Boolean(config.indiaFilter),
        maxItems: 1,
      });
      return Response.json({ ok: true, type: "scrape", preview });
    }

    return Response.json(
      { error: `Test not supported for type ${source.type}` },
      { status: 400 },
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
