import { z } from "zod";
import {
  authErrorResponse,
  requireCronOrIngestAuth,
} from "@/lib/editorial/auth";
import { ingestRssFeeds } from "@/lib/editorial/ingest-rss";
import type { FetchFrequency } from "@/lib/editorial/types";
import { FETCH_FREQUENCIES } from "@/lib/editorial/types";

const bodySchema = z.object({
  frequencies: z.array(z.enum(FETCH_FREQUENCIES)).optional(),
  limitPerSource: z.number().int().positive().max(50).optional(),
});

async function handle(request: Request) {
  try {
    requireCronOrIngestAuth(request as import("next/server").NextRequest);

    let frequencies: FetchFrequency[] | undefined;
    let limitPerSource: number | undefined;

    if (request.method === "POST") {
      const json = await request.json().catch(() => ({}));
      const parsed = bodySchema.safeParse(json);
      if (!parsed.success) {
        return Response.json(
          { error: parsed.error.flatten() },
          { status: 400 },
        );
      }
      frequencies = parsed.data.frequencies;
      limitPerSource = parsed.data.limitPerSource;
    } else {
      const url = new URL(request.url);
      const freq = url.searchParams.get("frequency");
      if (freq && FETCH_FREQUENCIES.includes(freq as FetchFrequency)) {
        frequencies = [freq as FetchFrequency];
      }
    }

    const result = await ingestRssFeeds({ frequencies, limitPerSource });
    return Response.json({
      ok: true,
      totalInserted: result.totalInserted,
      results: result.results,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
