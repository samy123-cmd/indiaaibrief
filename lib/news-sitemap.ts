import { getAllPosts } from "@/lib/content";
import type { Article } from "@/types";

/** Google News sitemaps should only list articles from the last ~2 days. */
export const NEWS_SITEMAP_WINDOW_MS = 48 * 60 * 60 * 1000;

export async function getRecentNewsForSitemap(
  now = Date.now(),
): Promise<Article[]> {
  const cutoff = now - NEWS_SITEMAP_WINDOW_MS;
  return (await getAllPosts("news")).filter(
    (post) => new Date(post.publishedAt).getTime() >= cutoff,
  );
}
