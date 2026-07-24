import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  authErrorResponse,
  requireEditor,
} from "@/lib/editorial/auth";
import {
  createDbArticle,
  listDbArticles,
} from "@/lib/editorial/articles";
import { CONTENT_CATEGORIES } from "@/lib/content";

const createSchema = z.object({
  title: z.string().min(5).max(60),
  description: z.string().min(10).max(160),
  slug: z.string().min(3).max(200).optional(),
  category: z.enum(CONTENT_CATEGORIES),
  author: z.string().min(2).max(100).optional(),
  tags: z.array(z.string()).optional(),
  image: z.string().min(1).optional(),
  imageAlt: z.string().min(1),
  bodyMdx: z.string().min(40),
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  sourceUrl: z.string().url().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    await requireEditor();
    const url = new URL(request.url);
    const status = url.searchParams.get("status") as
      | "draft"
      | "published"
      | "archived"
      | null;
    const items = await listDbArticles({
      status: status ?? undefined,
    });
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

    const data = parsed.data;
    const status = data.status ?? "draft";
    const now = new Date();

    const item = await createDbArticle({
      title: data.title,
      description: data.description,
      slug: data.slug,
      category: data.category,
      author: data.author ?? "indiaaibrief-desk",
      tags: data.tags?.length ? data.tags : [data.category],
      image: data.image ?? "/images/articles/placeholder.svg",
      imageAlt: data.imageAlt,
      bodyMdx: data.bodyMdx,
      featured: data.featured ?? false,
      trending: data.trending ?? false,
      status,
      sourceUrl: data.sourceUrl ?? null,
      publishedAt: status === "published" ? now : null,
    });

    if (status === "published") {
      revalidatePath("/");
      revalidatePath(`/${item.category}`);
      revalidatePath(`/${item.category}/${item.slug}`);
    }

    return Response.json(
      {
        ok: true,
        item,
        url: `/${item.category}/${item.slug}`,
      },
      { status: 201 },
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
