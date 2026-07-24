import { z } from "zod";
import {
  authErrorResponse,
  requireEditor,
} from "@/lib/editorial/auth";
import {
  listAllFigures,
  upsertFigure,
} from "@/lib/editorial/figures";

const figureSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9_]+$/, "key must be snake_case"),
  label: z.string().min(2).max(300),
  value: z.string().min(1),
  unit: z.string().max(80).optional().nullable(),
  groupKey: z.string().min(2).max(120),
  category: z.string().min(2).max(100).optional(),
  sourceName: z.string().min(1).max(200),
  sourceUrl: z.string().url().optional().nullable().or(z.literal("")),
  asOfDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    await requireEditor();
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get("all") === "1";
    const items = await listAllFigures(includeInactive);
    return Response.json({ items });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireEditor();
    const json = await request.json();
    const parsed = figureSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const item = await upsertFigure({
      key: data.key,
      label: data.label,
      value: data.value,
      unit: data.unit || null,
      groupKey: data.groupKey,
      category: data.category ?? "general",
      sourceName: data.sourceName,
      sourceUrl: data.sourceUrl || null,
      asOfDate: data.asOfDate ? new Date(data.asOfDate) : null,
      notes: data.notes || null,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    });

    return Response.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
