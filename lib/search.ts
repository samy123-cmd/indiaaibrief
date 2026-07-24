import type { Post } from "@/types";
import { getAllPosts } from "@/lib/content";
import { SEED_STARTUPS } from "@/lib/seed-data";

export interface SearchHit {
  type: "article" | "startup" | "product";
  title: string;
  description: string;
  url: string;
  meta?: string;
}

function scoreText(haystack: string, needle: string): number {
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase().trim();
  if (!n) return 0;
  if (h === n) return 100;
  if (h.startsWith(n)) return 80;
  if (h.includes(n)) return 50;
  const parts = n.split(/\s+/).filter(Boolean);
  const hits = parts.filter((p) => h.includes(p)).length;
  return hits === 0 ? 0 : (hits / parts.length) * 40;
}

function scorePost(post: Post, query: string): number {
  return (
    scoreText(post.title, query) * 3 +
    scoreText(post.excerpt, query) * 1.5 +
    scoreText(post.description, query) +
    scoreText(post.tags.join(" "), query) * 2 +
    scoreText(post.category, query)
  );
}

const PRODUCTS: SearchHit[] = [
  {
    type: "product",
    title: "AI Compliance Starter Kit",
    description: "Playbook, 47-point checklist, and workspace — ₹999.",
    url: "/kit/ai-compliance",
    meta: "Product",
  },
  {
    type: "product",
    title: "AI Readiness Audit",
    description: "47-point scorecard with 3-day PDF report — ₹4,999.",
    url: "/audit",
    meta: "Service",
  },
  {
    type: "product",
    title: "Subscribe to The Brief",
    description: "Free account and founding lists for Brief / Intelligence.",
    url: "/subscribe",
    meta: "Membership",
  },
];

export async function searchSite(query: string, limit = 24): Promise<SearchHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const posts = await getAllPosts();
  const articleHits = posts
    .map((post) => ({
      score: scorePost(post, q),
      hit: {
        type: "article" as const,
        title: post.title,
        description: post.excerpt || post.description,
        url: post.url,
        meta: post.category,
      },
    }))
    .filter((row) => row.score > 0);

  const startupHits = SEED_STARTUPS.map((startup) => ({
    score:
      scoreText(startup.name, q) * 3 +
      scoreText(startup.summary, q) +
      scoreText(startup.city, q) +
      scoreText(startup.sector, q) +
      scoreText(startup.tags.join(" "), q) * 2,
    hit: {
      type: "startup" as const,
      title: startup.name,
      description: startup.summary,
      url: `/startups/${startup.slug}`,
      meta: `${startup.city} · ${startup.sector}`,
    },
  })).filter((row) => row.score > 0);

  const productHits = PRODUCTS.map((product) => ({
    score:
      scoreText(product.title, q) * 3 + scoreText(product.description, q),
    hit: product,
  })).filter((row) => row.score > 0);

  return [...articleHits, ...startupHits, ...productHits]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.hit);
}
