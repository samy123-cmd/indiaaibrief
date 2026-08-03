import { NextResponse } from "next/server";
import { getRecentNewsForSitemap } from "@/lib/news-sitemap";
import { absoluteUrl } from "@/lib/utils";

export async function GET() {
  const recentNews = await getRecentNewsForSitemap();

  if (recentNews.length === 0) {
    return new NextResponse(null, {
      status: 404,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentNews
  .map(
    (post) => `  <url>
    <loc>${absoluteUrl(post.url)}</loc>
    <news:news>
      <news:publication>
        <news:name>IndiaAIBrief</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${post.publishedAt}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
