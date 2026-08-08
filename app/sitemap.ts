import type { MetadataRoute } from "next";
import { AUTHORS } from "@/lib/authors";
import { CATEGORY_COPY } from "@/lib/categories";
import { CONTENT_CATEGORIES, getAllPosts } from "@/lib/content";
import { SEED_STARTUPS } from "@/lib/seed-data";
import { absoluteUrl } from "@/lib/utils";

/**
 * Stable lastmod for evergreen marketing URLs.
 * Using `new Date()` on every build made every URL look freshly changed and
 * burned crawl budget (GSC: Discovered – currently not indexed).
 */
const EVERGREEN_LASTMOD = new Date("2026-08-01T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const newestArticleAt = posts.reduce((latest, post) => {
    const t = new Date(post.modifiedAt || post.publishedAt).getTime();
    return t > latest ? t : latest;
  }, EVERGREEN_LASTMOD.getTime());
  const homepageLastMod = new Date(newestArticleAt);

  const homepage: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: homepageLastMod,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CONTENT_CATEGORIES.map(
    (category) => {
      const catPosts = posts.filter((p) => p.category === category);
      const lastModified = catPosts.reduce((latest, post) => {
        const t = new Date(post.modifiedAt || post.publishedAt).getTime();
        return t > latest ? t : latest;
      }, EVERGREEN_LASTMOD.getTime());
      return {
        url: absoluteUrl(CATEGORY_COPY[category].path),
        lastModified: new Date(lastModified),
        changeFrequency: category === "news" ? ("daily" as const) : ("weekly" as const),
        priority: 0.8,
      };
    },
  );

  const productRoutes: MetadataRoute.Sitemap = [
    "/kit/ai-compliance",
    "/audit",
    "/subscribe",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: EVERGREEN_LASTMOD,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const staticRoutes = [
    "/about",
    "/authors",
    "/contact",
    "/careers",
    "/startups",
    "/policy",
    "/newsletter",
    "/privacy",
    "/terms",
    "/cookies",
    "/refund",
    "/editorial",
    "/dmca",
  ];

  const marketing: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: absoluteUrl(path),
    lastModified: EVERGREEN_LASTMOD,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const authorRoutes: MetadataRoute.Sitemap = Object.values(AUTHORS).map(
    (author) => ({
      url: absoluteUrl(`/authors/${author.slug}`),
      lastModified: EVERGREEN_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }),
  );

  const startupRoutes: MetadataRoute.Sitemap = SEED_STARTUPS.map((startup) => ({
    url: absoluteUrl(`/startups/${startup.slug}`),
    lastModified: EVERGREEN_LASTMOD,
    changeFrequency: "weekly" as const,
    priority: 0.55,
  }));

  const articles: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(post.url),
    lastModified: new Date(post.modifiedAt || post.publishedAt),
    changeFrequency:
      post.category === "news"
        ? ("daily" as const)
        : post.category === "playbooks"
          ? ("monthly" as const)
          : ("weekly" as const),
    priority: 0.6,
  }));

  return [
    ...homepage,
    ...categoryRoutes,
    ...productRoutes,
    ...marketing,
    ...authorRoutes,
    ...startupRoutes,
    ...articles,
  ];
}
