import { Meilisearch, type Index } from "meilisearch";
import type { SearchResult } from "@/types";

function getMeiliClient(): Meilisearch {
  const host = process.env.MEILI_HOST ?? process.env.NEXT_PUBLIC_MEILI_HOST;
  const apiKey =
    process.env.MEILI_MASTER_KEY ?? process.env.NEXT_PUBLIC_MEILI_SEARCH_KEY;

  if (!host) {
    throw new Error("MEILI_HOST is not configured");
  }

  return new Meilisearch({
    host,
    apiKey,
  });
}

export function getArticlesIndex(): Index {
  return getMeiliClient().index("articles");
}

export async function searchArticles(
  query: string,
  limit = 10,
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const index = getArticlesIndex();
  const result = await index.search<SearchResult>(query, {
    limit,
    attributesToRetrieve: [
      "id",
      "title",
      "excerpt",
      "url",
      "category",
      "publishedAt",
    ],
  });

  return result.hits;
}
