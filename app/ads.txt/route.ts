import { NextResponse } from "next/server";

/**
 * AdSense crawlers expect a real ads.txt or a clean 404.
 * Do not publish public/ads.txt until Google AdSense approves the site.
 * Until then this route must not soft-serve HTML (homepage) at /ads.txt.
 */
export function GET() {
  return new NextResponse("Not Found\n", {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  });
}
