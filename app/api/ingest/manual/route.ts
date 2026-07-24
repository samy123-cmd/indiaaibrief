import { z } from "zod";
import {
  authErrorResponse,
  requireEditor,
} from "@/lib/editorial/auth";
import { classifyIndiaRelevance } from "@/lib/editorial/classify";
import { insertSignalFromItem } from "@/lib/editorial/ingest-shared";
import { SIGNAL_CATEGORIES } from "@/lib/editorial/types";

const bodySchema = z.object({
  title: z.string().min(3).max(500),
  sourceUrl: z.string().url(),
  category: z.enum(SIGNAL_CATEGORIES).optional(),
  summary: z.string().max(5000).optional(),
  rawContent: z.string().max(50000).optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  try {
    await requireEditor();

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const classified = classifyIndiaRelevance({
      title: data.title,
      summary: data.summary,
      rawContent: data.rawContent,
      source: data.source ?? "manual",
    });

    const outcome = await insertSignalFromItem(
      {
        title: data.title,
        sourceUrl: data.sourceUrl,
        summary: data.summary ?? "",
        rawContent: data.rawContent ?? data.summary ?? "",
        publishedAt: new Date(),
      },
      {
        sourceName: data.source ?? "manual",
        sourceType: "manual",
      },
    );

    if (outcome === "skipped") {
      return Response.json(
        { error: "Signal with this sourceUrl already exists" },
        { status: 409 },
      );
    }

    return Response.json({
      ok: true,
      classification: {
        ...classified,
        category: data.category ?? classified.category,
        tags: data.tags ?? classified.tags,
      },
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
