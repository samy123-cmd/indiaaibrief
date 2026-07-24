import { eq } from "drizzle-orm";
import { z } from "zod";
import { sources } from "@/drizzle/schema";
import {
  authErrorResponse,
  requireEditor,
} from "@/lib/editorial/auth";
import {
  FETCH_FREQUENCIES,
  SOURCE_TYPES,
} from "@/lib/editorial/types";
import { getDb } from "@/lib/db";

const patchSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  url: z.string().url().optional(),
  type: z.enum(SOURCE_TYPES).optional(),
  category: z.string().min(2).max(100).optional(),
  isActive: z.boolean().optional(),
  fetchFrequency: z.enum(FETCH_FREQUENCIES).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireEditor();
    const { id } = await context.params;
    const json = await request.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const db = getDb();
    const [item] = await db
      .update(sources)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(sources.id, id))
      .returning();

    if (!item) {
      return Response.json({ error: "Source not found" }, { status: 404 });
    }

    return Response.json({ ok: true, item });
  } catch (error) {
    return authErrorResponse(error);
  }
}
