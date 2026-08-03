import type { MetadataRoute } from "next";
import { getRecentNewsForSitemap } from "@/lib/news-sitemap";
import { absoluteUrl } from "@/lib/utils";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const recentNews = await getRecentNewsForSitemap();
  const sitemaps = [
    absoluteUrl("/sitemap.xml"),
    absoluteUrl("/image-sitemap.xml"),
  ];
  if (recentNews.length > 0) {
    sitemaps.splice(1, 0, absoluteUrl("/news-sitemap.xml"));
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/404", "/500"],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Googlebot-News",
        allow: "/",
      },
    ],
    sitemap: sitemaps,
  };
}
