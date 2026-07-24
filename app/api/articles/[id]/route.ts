import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  authErrorResponse,
  requireEditor,
} from "@/lib/editorial/auth";
import {
  getDbArticleById,
  updateDbArticle,
} from "@/lib/editorial/articles";
import { CONTENT_CATEGORIES } from "@/lib/content";

const patchSchema = z.object({
  title: z.string().min(5).max(60).optional(),
  description: z.string().min(10).max(160).optional(),
  slug: z.string().min(3).max(200).optional(),
  category: z.enum(CONTENT_CATEGORIES).optional(),
  author: z.string().min(2).max(100).optional(),
  tags: z.array(z.string()).optional(),
  image: z.string().min(1).optional(),
  imageAlt: z.string().min(1).optional(),
  bodyMdx: z.string().min(40).optional(),
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  sourceUrl: z.string().url().optional().nullable(),
  correctionNote: z.string().optional().nullable(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireEditor();
    const { id } = await context.params;
    const item = await getDbArticleById(id);
    if (!item) {
      return Response.json({ error: "Article not found" }, { status: 404 });
    }
    return Response.json({ item });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireEditor();
    const { id } = await context.params;
    const existing = await getDbArticleById(id);
    if (!existing) {
      return Response.json({ error: "Article not found" }, { status: 404 });
    }

    const json = await request.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const becomingPublished =
      data.status === "published" && existing.status !== "published";

    const item = await updateDbArticle(id, {
      ...data,
      publishedAt: becomingPublished
        ? new Date()
        : data.status === "draft"
          ? null
          : undefined,
    });

    if (!item) {
      return Response.json({ error: "Update failed" }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath(`/${item.category}`);
    revalidatePath(`/${item.category}/${item.slug}`);
    if (existing.slug !== item.slug || existing.category !== item.category) {
      revalidatePath(`/${existing.category}/${existing.slug}`);
    }

    return Response.json({
      ok: true,
      item,
      url: `/${item.category}/${item.slug}`,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
