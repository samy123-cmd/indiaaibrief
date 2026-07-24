import { z } from "zod";
import {
  authErrorResponse,
  requireEditor,
} from "@/lib/editorial/auth";
import { updateFigureById } from "@/lib/editorial/figures";
import { revalidatePath } from "next/cache";

const patchSchema = z.object({
  label: z.string().min(2).max(300).optional(),
  value: z.string().min(1).optional(),
  unit: z.string().max(80).optional().nullable(),
  groupKey: z.string().min(2).max(120).optional(),
  category: z.string().min(2).max(100).optional(),
  sourceName: z.string().min(1).max(200).optional(),
  sourceUrl: z.string().url().optional().nullable().or(z.literal("")),
  asOfDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
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

    const data = parsed.data;
    const item = await updateFigureById(id, {
      ...data,
      sourceUrl: data.sourceUrl === "" ? null : data.sourceUrl,
      asOfDate:
        data.asOfDate === undefined
          ? undefined
          : data.asOfDate
            ? new Date(data.asOfDate)
            : null,
    });

    if (!item) {
      return Response.json({ error: "Figure not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/data");
    revalidatePath("/data/ai-in-india-market-statistics-2026");

    return Response.json({ ok: true, item });
  } catch (error) {
    return authErrorResponse(error);
  }
}
