import "server-only";

import fs from "node:fs";
import path from "node:path";
import { and, desc, eq } from "drizzle-orm";
import matter from "gray-matter";
import { z } from "zod";
import type { ArticleCardData } from "@/components/content/article-card";
import { articles } from "@/drizzle/schema";
import { getAuthor } from "@/lib/authors";
import {
  calculateReadingTime,
  generateExcerpt,
} from "@/lib/content-utils";
import { absoluteUrl } from "@/lib/utils";
import type { ContentCategory, FaqItem, Post } from "@/types";

export { calculateReadingTime, generateExcerpt } from "@/lib/content-utils";

export const CONTENT_CATEGORIES = [
  "news",
  "explains",
  "compares",
  "playbooks",
  "data",
] as const satisfies readonly ContentCategory[];

const CONTENT_ROOT = path.join(process.cwd(), "content");

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  publishedAt: z.string().min(1),
  modifiedAt: z.string().min(1),
  author: z.string().min(1),
  category: z.enum(CONTENT_CATEGORIES),
  tags: z.array(z.string()).default([]),
  image: z.string().min(1),
  imageAlt: z.string().min(1),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  readingTime: z.number().positive().optional(),
  excerpt: z.string().optional(),
  canonical: z.string().optional(),
  structuredData: z
    .object({
      type: z.enum(["NewsArticle", "Article", "FAQPage"]),
      faq: z.array(faqSchema).optional(),
    })
    .optional(),
});

export function isContentCategory(value: string): value is ContentCategory {
  return (CONTENT_CATEGORIES as readonly string[]).includes(value);
}

function categoryDir(category: ContentCategory): string {
  return path.join(CONTENT_ROOT, category);
}

function parsePostFile(
  category: ContentCategory,
  filename: string,
): Post | null {
  if (!filename.endsWith(".mdx")) return null;

  const slug = filename.replace(/\.mdx$/, "");
  const fullPath = path.join(categoryDir(category), filename);

  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const parsed = frontmatterSchema.safeParse(data);

  if (!parsed.success) {
    console.error(
      `[content] Invalid frontmatter in ${category}/${filename}:`,
      parsed.error.flatten(),
    );
    return null;
  }

  const fm = parsed.data;
  if (fm.category !== category) {
    console.error(
      `[content] Category mismatch in ${category}/${filename}: frontmatter says ${fm.category}`,
    );
    return null;
  }

  const body = content.trim();
  const readingTime = fm.readingTime ?? calculateReadingTime(body);
  const excerpt = fm.excerpt?.trim() || generateExcerpt(body);

  return {
    title: fm.title,
    description: fm.description,
    publishedAt: fm.publishedAt,
    modifiedAt: fm.modifiedAt,
    author: fm.author,
    category: fm.category,
    tags: fm.tags,
    image: fm.image,
    imageAlt: fm.imageAlt,
    featured: fm.featured,
    trending: fm.trending,
    readingTime,
    excerpt,
    canonical: fm.canonical,
    structuredData: fm.structuredData
      ? {
          type: fm.structuredData.type,
          faq: fm.structuredData.faq as FaqItem[] | undefined,
        }
      : undefined,
    slug,
    url: `/${category}/${slug}`,
    body,
  };
}

function listMdxFilenames(category: ContentCategory): string[] {
  const dir = categoryDir(category);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .sort();
}

function getMdxPosts(category?: ContentCategory): Post[] {
  const categories = category ? [category] : [...CONTENT_CATEGORIES];
  const posts: Post[] = [];

  for (const cat of categories) {
    for (const filename of listMdxFilenames(cat)) {
      const post = parsePostFile(cat, filename);
      if (post) posts.push(post);
    }
  }

  return posts;
}

function dbRowToPost(row: typeof articles.$inferSelect): Post {
  const publishedAt = (row.publishedAt ?? row.createdAt).toISOString();
  const body = row.correctionNote
    ? `> **Correction:** ${row.correctionNote}\n\n${row.bodyMdx}`
    : row.bodyMdx;

  return {
    title: row.title,
    description: row.description,
    publishedAt,
    modifiedAt: row.modifiedAt.toISOString(),
    author: row.author,
    category: row.category,
    tags: row.tags,
    image: row.image,
    imageAlt: row.imageAlt,
    featured: row.featured,
    trending: row.trending,
    readingTime: row.readingTime,
    excerpt: row.excerpt || generateExcerpt(body),
    canonical: row.canonical ?? undefined,
    structuredData: {
      type: "NewsArticle",
    },
    slug: row.slug,
    url: `/${row.category}/${row.slug}`,
    body,
  };
}

async function getDbPosts(category?: ContentCategory): Promise<Post[]> {
  if (!process.env.DATABASE_URL) return [];
  // Build-time prerender: use MDX only so we don't open 15× DB pools (EMAXCONNSESSION).
  const { isProductionBuildPhase } = await import("@/lib/db");
  if (isProductionBuildPhase()) return [];

  try {
    const { getDb } = await import("@/lib/db");
    const db = getDb();
    const conditions = [eq(articles.status, "published")];
    if (category) conditions.push(eq(articles.category, category));

    const rows = await db
      .select()
      .from(articles)
      .where(and(...conditions))
      .orderBy(desc(articles.publishedAt));

    return rows.map(dbRowToPost);
  } catch (error) {
    console.error("[content] Failed to load DB articles:", error);
    return [];
  }
}

function mergePosts(mdx: Post[], db: Post[]): Post[] {
  const byKey = new Map<string, Post>();

  for (const post of mdx) {
    byKey.set(`${post.category}/${post.slug}`, post);
  }

  // DB articles win on slug collision (fresher pipeline publishes)
  for (const post of db) {
    byKey.set(`${post.category}/${post.slug}`, post);
  }

  return Array.from(byKey.values()).sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getAllPosts(category?: ContentCategory): Promise<Post[]> {
  const [mdx, db] = await Promise.all([
    Promise.resolve(getMdxPosts(category)),
    getDbPosts(category),
  ]);
  return mergePosts(mdx, db);
}

export async function getPostBySlug(
  category: ContentCategory,
  slug: string,
): Promise<Post | null> {
  const mdx = parsePostFile(category, `${slug}.mdx`);

  if (!process.env.DATABASE_URL) return mdx;

  const { isProductionBuildPhase } = await import("@/lib/db");
  if (isProductionBuildPhase()) return mdx;

  try {
    const { getDb } = await import("@/lib/db");
    const db = getDb();
    const [row] = await db
      .select()
      .from(articles)
      .where(
        and(
          eq(articles.category, category),
          eq(articles.slug, slug),
          eq(articles.status, "published"),
        ),
      )
      .limit(1);

    if (row) return dbRowToPost(row);
  } catch (error) {
    console.error("[content] Failed to load DB article:", error);
  }

  return mdx;
}

export async function getRelatedPosts(
  category: ContentCategory,
  slug: string,
  limit = 3,
): Promise<Post[]> {
  const posts = await getAllPosts(category);
  return posts.filter((post) => post.slug !== slug).slice(0, limit);
}

export async function getFeaturedPosts(): Promise<Post[]> {
  return (await getAllPosts()).filter((post) => post.featured);
}

export async function getTrendingPosts(limit = 5): Promise<Post[]> {
  return (await getAllPosts())
    .filter((post) => post.trending)
    .slice(0, limit);
}

export function toArticleCardData(post: Post): ArticleCardData {
  const author = getAuthor(post.author);
  return {
    title: post.title,
    excerpt: post.excerpt,
    url: post.url,
    category: post.category,
    image: post.image,
    imageAlt: post.imageAlt,
    publishedAt: post.publishedAt,
    readingTime: post.readingTime,
    author: {
      name: author.name,
      avatar: author.avatar,
    },
  };
}

export function getPostAbsoluteUrl(post: Post): string {
  return post.canonical ?? absoluteUrl(post.url);
}
