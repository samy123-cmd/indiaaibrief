import { NextResponse } from "next/server";
import { searchArticles } from "@/lib/meilisearch";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limit = Number(searchParams.get("limit") ?? "10");

  try {
    const results = await searchArticles(q, Number.isFinite(limit) ? limit : 10);
    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message, results: [] }, { status: 503 });
  }
}
