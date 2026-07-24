import { desc } from "drizzle-orm";
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

const createSchema = z.object({
  name: z.string().min(2).max(200),
  url: z.string().url(),
  type: z.enum(SOURCE_TYPES),
  category: z.string().min(2).max(100),
  isActive: z.boolean().optional(),
  fetchFrequency: z.enum(FETCH_FREQUENCIES).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  try {
    await requireEditor();
    const db = getDb();
    const items = await db
      .select()
      .from(sources)
      .orderBy(desc(sources.updatedAt));
    return Response.json({ items });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireEditor();
    const json = await request.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const db = getDb();
    const [item] = await db
      .insert(sources)
      .values({
        name: parsed.data.name,
        url: parsed.data.url,
        type: parsed.data.type,
        category: parsed.data.category,
        isActive: parsed.data.isActive ?? true,
        fetchFrequency: parsed.data.fetchFrequency ?? "1hour",
        config: parsed.data.config ?? {},
      })
      .returning();

    return Response.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
