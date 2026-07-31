import type { MetadataRoute } from "next";
import { AUTHORS } from "@/lib/authors";
import { CATEGORY_COPY } from "@/lib/categories";
import { CONTENT_CATEGORIES, getAllPosts } from "@/lib/content";
import { SEED_STARTUPS } from "@/lib/seed-data";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const homepage: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CONTENT_CATEGORIES.map(
    (category) => ({
      url: absoluteUrl(CATEGORY_COPY[category].path),
      lastModified: now,
      changeFrequency: category === "news" ? "daily" : "weekly",
      priority: 0.8,
    }),
  );

  const productRoutes: MetadataRoute.Sitemap = [
    "/kit/ai-compliance",
    "/audit",
    "/subscribe",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
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
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const authorRoutes: MetadataRoute.Sitemap = Object.values(AUTHORS).map(
    (author) => ({
      url: absoluteUrl(`/authors/${author.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }),
  );

  const startupRoutes: MetadataRoute.Sitemap = SEED_STARTUPS.map((startup) => ({
    url: absoluteUrl(`/startups/${startup.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.55,
  }));

  const posts = await getAllPosts();
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
