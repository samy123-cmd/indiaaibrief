import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { articles, type DbArticle, type NewDbArticle } from "@/drizzle/schema";
import {
  calculateReadingTime,
  generateExcerpt,
} from "@/lib/content-utils";
import { getDb } from "@/lib/db";
import { slugify } from "@/lib/editorial/publish";
import type { ContentCategory } from "@/types";

export async function listDbArticles(opts?: {
  status?: "draft" | "published" | "archived";
  category?: ContentCategory;
}) {
  const db = getDb();
  const conditions = [];
  if (opts?.status) conditions.push(eq(articles.status, opts.status));
  if (opts?.category) conditions.push(eq(articles.category, opts.category));

  return db
    .select()
    .from(articles)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(articles.updatedAt));
}

export async function getDbArticleById(id: string): Promise<DbArticle | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);
  return row ?? null;
}

export async function createDbArticle(
  input: Omit<
    NewDbArticle,
    "id" | "createdAt" | "updatedAt" | "readingTime" | "excerpt" | "slug"
  > & {
    slug?: string;
    readingTime?: number;
    excerpt?: string;
  },
): Promise<DbArticle> {
  const db = getDb();
  const body = input.bodyMdx;
  const readingTime = input.readingTime ?? calculateReadingTime(body);
  const excerpt = input.excerpt ?? generateExcerpt(body);
  const slug = input.slug || slugify(input.title);

  const [row] = await db
    .insert(articles)
    .values({
      ...input,
      slug,
      readingTime,
      excerpt,
      modifiedAt: new Date(),
    })
    .returning();

  return row!;
}

export async function updateDbArticle(
  id: string,
  patch: Partial<NewDbArticle>,
): Promise<DbArticle | null> {
  const db = getDb();
  const existing = await getDbArticleById(id);
  if (!existing) return null;

  const body = patch.bodyMdx ?? existing.bodyMdx;
  const readingTime =
    patch.readingTime ??
    (patch.bodyMdx ? calculateReadingTime(body) : existing.readingTime);
  const excerpt =
    patch.excerpt ??
    (patch.bodyMdx ? generateExcerpt(body) : existing.excerpt);

  const [row] = await db
    .update(articles)
    .set({
      ...patch,
      readingTime,
      excerpt,
      modifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(articles.id, id))
    .returning();

  return row ?? null;
}
