import { z } from "zod";
import {
  authErrorResponse,
  requireCronOrIngestAuth,
} from "@/lib/editorial/auth";
import { ingestScrapeSources } from "@/lib/editorial/ingest-scrape";
import type { FetchFrequency } from "@/lib/editorial/types";
import { FETCH_FREQUENCIES } from "@/lib/editorial/types";

const bodySchema = z.object({
  frequencies: z.array(z.enum(FETCH_FREQUENCIES)).optional(),
});

async function handle(request: Request) {
  try {
    requireCronOrIngestAuth(request as import("next/server").NextRequest);

    let frequencies: FetchFrequency[] | undefined;

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
    } else {
      const url = new URL(request.url);
      const freq = url.searchParams.get("frequency");
      if (freq && FETCH_FREQUENCIES.includes(freq as FetchFrequency)) {
        frequencies = [freq as FetchFrequency];
      }
    }

    const result = await ingestScrapeSources({ frequencies });
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
