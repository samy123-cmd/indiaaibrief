import { eq } from "drizzle-orm";
import { z } from "zod";
import { signals } from "@/drizzle/schema";
import {
  authErrorResponse,
  requireEditor,
} from "@/lib/editorial/auth";
import {
  buildPublishChecklist,
  publishSignalToArticle,
} from "@/lib/editorial/publish";
import { getSignalById } from "@/lib/editorial/queries";
import { CONTENT_CATEGORIES } from "@/lib/content";
import { getDb } from "@/lib/db";

const bodySchema = z.object({
  title: z.string().min(1).max(60).optional(),
  description: z.string().min(1).max(160).optional(),
  author: z.string().min(1).max(100).optional(),
  image: z.string().min(1).optional(),
  imageAlt: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  category: z.enum(CONTENT_CATEGORIES).optional(),
  body: z.string().min(40).optional(),
  checklistOnly: z.boolean().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireEditor();
    const { id } = await context.params;
    const signal = await getSignalById(id);

    if (!signal) {
      return Response.json({ error: "Signal not found" }, { status: 404 });
    }

    const json = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const body = data.body ?? signal.aiDraft ?? "";

    if (data.body) {
      const db = getDb();
      await db
        .update(signals)
        .set({ aiDraft: data.body, updatedAt: new Date() })
        .where(eq(signals.id, id));
    }

    const checklist = buildPublishChecklist({
      title: (data.title ?? signal.title).slice(0, 60),
      description: (
        data.description ??
        signal.summary ??
        ""
      ).slice(0, 160),
      image: data.image ?? "/images/articles/placeholder.svg",
      category: data.category ?? "news",
      tags: data.tags ?? signal.tags,
      author: data.author ?? "indiaaibrief-desk",
      body,
      sourceUrl: signal.sourceUrl,
    });

    if (data.checklistOnly) {
      return Response.json({ checklist });
    }

    if (checklist.errors.length > 0) {
      return Response.json(
        { error: "Publish checklist failed", checklist },
        { status: 400 },
      );
    }

    const fresh = (await getSignalById(id))!;
    const published = await publishSignalToArticle({
      signal: { ...fresh, aiDraft: body },
      actorId: userId,
      title: data.title,
      description: data.description,
      author: data.author,
      image: data.image,
      imageAlt: data.imageAlt,
      tags: data.tags,
      category: data.category,
      body,
    });

    return Response.json({ ok: true, published, checklist });
  } catch (error) {
    return authErrorResponse(error);
  }
}
