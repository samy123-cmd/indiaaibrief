import "server-only";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  articles,
  auditLogs,
  signals,
  type Signal,
} from "@/drizzle/schema";
import {
  calculateReadingTime,
  generateExcerpt,
} from "@/lib/content-utils";
import type { PublishChecklist } from "@/lib/editorial/types";
import { getDb } from "@/lib/db";
import type { ContentCategory } from "@/types";

const DEFAULT_IMAGE = "/images/articles/placeholder.svg";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function mapSignalCategoryToContent(
  category: Signal["category"],
): ContentCategory {
  switch (category) {
    case "policy":
    case "regulation":
    case "funding":
    case "acquisition":
    case "partnership":
    case "product_launch":
    case "controversy":
      return "news";
    case "research":
      return "explains";
    case "opportunity":
      return "playbooks";
    default:
      return "news";
  }
}

export function buildPublishChecklist(input: {
  title: string;
  description: string;
  image?: string;
  category?: string;
  tags?: string[];
  author?: string;
  body: string;
  sourceUrl?: string;
}): PublishChecklist {
  const errors: string[] = [];
  const titleOk = input.title.length > 0 && input.title.length <= 60;
  const descriptionOk =
    input.description.length > 0 && input.description.length <= 160;
  const imageOk = Boolean(input.image && input.image.length > 0);
  const categoryOk = Boolean(input.category);
  const tagsOk = Boolean(input.tags && input.tags.length > 0);
  const authorOk = Boolean(input.author && input.author.length > 0);
  const indiaAngleOk =
    /why (does )?this matter to india|what this means for indian/i.test(
      input.body,
    );
  const sourceAttributionOk = Boolean(
    input.sourceUrl && input.body.includes(input.sourceUrl),
  );

  if (!titleOk) errors.push("Title must be 1–60 characters");
  if (!descriptionOk) errors.push("Description must be 1–160 characters");
  if (!imageOk) errors.push("Image is required");
  if (!categoryOk) errors.push("Category is required");
  if (!tagsOk) errors.push("At least one tag is required");
  if (!authorOk) errors.push("Author is required");
  if (!indiaAngleOk)
    errors.push('Body must include an India angle ("What This Means for Indian…")');
  if (!sourceAttributionOk)
    errors.push("Body must attribute the primary source URL");

  return {
    titleOk,
    descriptionOk,
    imageOk,
    categoryOk,
    tagsOk,
    authorOk,
    indiaAngleOk,
    sourceAttributionOk,
    errors,
  };
}

export async function publishSignalToArticle(opts: {
  signal: Signal;
  actorId: string;
  title?: string;
  description?: string;
  author?: string;
  image?: string;
  imageAlt?: string;
  tags?: string[];
  category?: ContentCategory;
  body?: string;
  skipChecklist?: boolean;
}): Promise<{ articleId: string; url: string; slug: string; category: ContentCategory }> {
  const db = getDb();
  const signal = opts.signal;
  const body = (opts.body ?? signal.aiDraft ?? "").trim();
  if (!body) {
    throw new Error("Cannot publish without a draft body");
  }

  const title = (opts.title ?? signal.title).slice(0, 60);
  const description = (
    opts.description ??
    signal.summary ??
    generateExcerpt(body, 160)
  ).slice(0, 160);
  const author = opts.author ?? "indiaaibrief-desk";
  const image = opts.image ?? DEFAULT_IMAGE;
  const imageAlt = opts.imageAlt ?? title;
  const tags =
    opts.tags && opts.tags.length > 0
      ? opts.tags
      : signal.tags.length > 0
        ? signal.tags
        : [signal.category];
  const category =
    opts.category ?? mapSignalCategoryToContent(signal.category);

  const checklist = buildPublishChecklist({
    title,
    description,
    image,
    category,
    tags,
    author,
    body,
    sourceUrl: signal.sourceUrl,
  });

  if (!opts.skipChecklist && checklist.errors.length > 0) {
    throw new Error(`Publish checklist failed: ${checklist.errors.join("; ")}`);
  }

  const slug = slugify(title);
  const now = new Date();
  const readingTime = calculateReadingTime(body);
  const excerpt = generateExcerpt(body);

  const existing = await db
    .select({ id: articles.id })
    .from(articles)
    .where(and(eq(articles.category, category), eq(articles.slug, slug)))
    .limit(1);

  const finalSlug =
    existing.length > 0 ? `${slug}-${signal.id.slice(0, 8)}` : slug;

  const [article] = await db
    .insert(articles)
    .values({
      signalId: signal.id,
      slug: finalSlug,
      category,
      title,
      description,
      author,
      tags,
      image,
      imageAlt,
      featured: signal.impactLevel === "critical",
      trending: signal.impactLevel === "critical" || signal.impactLevel === "high",
      readingTime,
      excerpt,
      bodyMdx: body,
      sourceUrl: signal.sourceUrl,
      status: "published",
      publishedAt: now,
      modifiedAt: now,
    })
    .returning();

  if (!article) {
    throw new Error("Failed to insert published article");
  }

  await db
    .update(signals)
    .set({
      status: "published",
      updatedAt: now,
      aiDraft: body,
    })
    .where(eq(signals.id, signal.id));

  await db.insert(auditLogs).values({
    signalId: signal.id,
    actorId: opts.actorId,
    action: "publish",
    meta: {
      articleId: article.id,
      url: `/${category}/${finalSlug}`,
    },
  });

  revalidatePath("/");
  revalidatePath(`/${category}`);
  revalidatePath(`/${category}/${finalSlug}`);
  revalidatePath("/sitemap.xml");

  await shareToTelegram({
    title,
    url: `/${category}/${finalSlug}`,
  });

  // Optional local MDX dual-write for git-backed workflows (dev only)
  if (process.env.NODE_ENV === "development" && process.env.EDITORIAL_WRITE_MDX === "1") {
    await dualWriteMdx({
      category,
      slug: finalSlug,
      title,
      description,
      author,
      tags,
      image,
      imageAlt,
      readingTime,
      excerpt,
      body,
      publishedAt: now.toISOString(),
    });
  }

  return {
    articleId: article.id,
    url: `/${category}/${finalSlug}`,
    slug: finalSlug,
    category,
  };
}

async function dualWriteMdx(opts: {
  category: ContentCategory;
  slug: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  image: string;
  imageAlt: string;
  readingTime: number;
  excerpt: string;
  body: string;
  publishedAt: string;
}): Promise<void> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "content", opts.category);
  await fs.mkdir(dir, { recursive: true });
  const frontmatter = `---
title: ${JSON.stringify(opts.title)}
description: ${JSON.stringify(opts.description)}
publishedAt: ${JSON.stringify(opts.publishedAt)}
modifiedAt: ${JSON.stringify(opts.publishedAt)}
author: ${JSON.stringify(opts.author)}
category: ${opts.category}
tags: ${JSON.stringify(opts.tags)}
image: ${JSON.stringify(opts.image)}
imageAlt: ${JSON.stringify(opts.imageAlt)}
featured: false
trending: false
readingTime: ${opts.readingTime}
excerpt: ${JSON.stringify(opts.excerpt)}
structuredData:
  type: NewsArticle
---

`;
  await fs.writeFile(
    path.join(dir, `${opts.slug}.mdx`),
    `${frontmatter}${opts.body}\n`,
    "utf8",
  );
}

async function shareToTelegram(opts: {
  title: string;
  url: string;
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.indiaaibrief.com";
  const text = `🇮🇳 ${opts.title}\n${site}${opts.url}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: false,
      }),
    });
  } catch (error) {
    console.error("[editorial/publish] Telegram share failed:", error);
  }
}
