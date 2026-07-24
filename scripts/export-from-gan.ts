/**
 * One-time export from Global AI News → indiaaibrief content JSON.
 * Does not modify the GAN repo.
 *
 *   npx tsx scripts/export-from-gan.ts
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

const IAB_ROOT = path.resolve(__dirname, "..");
const GAN_ROOT = path.resolve(
  IAB_ROOT,
  "..",
  "news-website-main",
  "news-website-main",
);

dotenv.config({ path: path.join(GAN_ROOT, ".env.local") });
dotenv.config({ path: path.join(IAB_ROOT, ".env.local") });

const INDIA_RE =
  /\b(india|indian|meity|indiaai|bengaluru|bangalore|hyderabad|mumbai|delhi|noida|chennai|varanasi|tcs|infosys|wipro|hcl|reliance|krutrim|sarvam|ai4bharat|bhashini|indic|niti aayog|nasscom|medianama|inc42)\b/i;

type ArticleOut = {
  id: string;
  type: "essay" | "briefing";
  title: string;
  slug: string;
  summary: string;
  body: string;
  category: string;
  tags: string[];
  publishedAt: string;
  author: string;
  authorRole?: string;
  readMins: number;
  imageUrl: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function filenameToSlug(filename: string): string {
  return filename
    .replace(/\.md$/i, "")
    .replace(/^\d+_/, "")
    .replace(/_/g, "-");
}

function estimateReadMins(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(3, Math.round(words / 220));
}

/** Repair common briefing HTML glitches so the site can render them as HTML. */
function normalizeBriefingBody(html: string): string {
  let clean = html.trim();
  if (!clean) return clean;
  clean = clean.replace(
    /(<div\s+class=["']briefing-takeaways["'][\s\S]*?<\/ul>)\s*<\/p>/gi,
    "$1</div>",
  );
  clean = clean.replace(
    /<\/ul>\s*<\/p>\s*(<section\s+class=["']briefing-section)/gi,
    "</ul></div>\n$1",
  );
  clean = clean.replace(
    /(<div\s+class=["']briefing-takeaways["'][^>]*>\s*)<(p|div)([^>]*)>(\s*(?:<strong>)?\s*Key takeaways\s*(?:<\/strong>)?\s*)<\/\2>/gi,
    '$1<p class="briefing-takeaways-label">Key takeaways</p>',
  );
  return clean;
}

function mapSeriesToCategory(series: string): string {
  if (series === "regulation") return "Policy";
  if (series === "industry") return "Industry";
  if (series === "research") return "Analysis";
  return "Analysis";
}

function parseEssayMarkdown(
  filePath: string,
  series: string,
): ArticleOut | null {
  const raw = fs.readFileSync(filePath, "utf8");
  const filename = path.basename(filePath);
  if (filename.startsWith("_")) return null;

  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const summaryMatch = raw.match(/\*\*Summary\*\*:\s*(.+)/i);
  const updatedMatch = raw.match(/\*Last Updated:\s*(.+)\*/i);

  const title = titleMatch?.[1]?.trim() || filenameToSlug(filename);
  const summary =
    summaryMatch?.[1]?.trim() ||
    raw
      .replace(/^#.*$/m, "")
      .replace(/\*\*[^*]+\*\*:/g, "")
      .trim()
      .slice(0, 220);
  const bodyStart = raw.indexOf("\n---\n");
  const body =
    bodyStart >= 0 ? raw.slice(bodyStart + 5).trim() : raw.replace(/^#.*\n/, "");

  const slug = filenameToSlug(filename);
  const publishedAt = updatedMatch
    ? new Date(updatedMatch[1].replace(/,/g, "")).toISOString()
    : new Date().toISOString();

  const tags = ["essay", series];
  if (INDIA_RE.test(`${title} ${summary} ${body.slice(0, 2000)}`)) {
    tags.push("india");
  }
  if (/startup|funding|seed|series/i.test(`${title} ${summary}`)) {
    tags.push("startups");
  }
  if (/policy|regulat|meity|governance|act\b/i.test(`${title} ${summary}`)) {
    tags.push("policy");
  }

  return {
    id: `essay-${slug}`,
    type: "essay",
    title,
    slug,
    summary,
    body,
    category: mapSeriesToCategory(series),
    tags,
    publishedAt: Number.isNaN(Date.parse(publishedAt))
      ? new Date().toISOString()
      : publishedAt,
    author: "Shiv Shakti Mishra",
    authorRole: "Founder & Editor",
    readMins: estimateReadMins(body),
    imageUrl: null,
    sourceName: null,
    sourceUrl: null,
  };
}

function exportEssaysFromDisk(): ArticleOut[] {
  const root = path.join(GAN_ROOT, "content", "authority-series");
  const essays: ArticleOut[] = [];
  for (const series of ["industry", "regulation", "research"]) {
    const dir = path.join(root, series);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".md") || file.startsWith("_")) continue;
      const parsed = parseEssayMarkdown(path.join(dir, file), series);
      if (parsed) essays.push(parsed);
    }
  }
  return essays;
}

async function exportStoriesFromSupabase(): Promise<ArticleOut[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("No Supabase credentials — skipping live India story export.");
    return [];
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("gan_stories")
    .select(
      "id,title,summary,body,source_url,source_name,category,published_at,image_url,status,impact_score,tags,read_time,curation_note",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(500);

  if (error) {
    console.warn("Supabase story export failed:", error.message);
    return [];
  }

  const rows = data || [];
  const india = rows.filter((row) => {
    const tags = Array.isArray(row.tags) ? row.tags.join(" ") : "";
    const blob = `${row.title} ${row.summary || ""} ${tags} ${row.source_name || ""}`;
    return (
      (Array.isArray(row.tags) && row.tags.includes("india")) ||
      INDIA_RE.test(blob)
    );
  });

  return india.map((row) => {
    const title = String(row.title || "Untitled");
    const baseSlug = slugify(title) || String(row.id).slice(0, 8);
    const body = normalizeBriefingBody(
      String(row.body || row.summary || row.curation_note || ""),
    );
    const tags = Array.isArray(row.tags)
      ? row.tags.map(String)
      : ["india", "briefing"];
    if (!tags.includes("india")) tags.push("india");
    if (!tags.includes("briefing")) tags.push("briefing");

    const cat = String(row.category || "Industry");
    if (/startup|funding/i.test(`${title} ${tags.join(" ")}`)) tags.push("startups");
    if (/policy|regulat|meity/i.test(`${title} ${tags.join(" ")}`)) tags.push("policy");

    return {
      id: String(row.id),
      type: "briefing" as const,
      title,
      slug: `briefing-${baseSlug}`,
      summary: String(row.summary || "").slice(0, 280),
      body,
      category: cat,
      tags: [...new Set(tags)],
      publishedAt: row.published_at
        ? new Date(row.published_at).toISOString()
        : new Date().toISOString(),
      author: "India AI Brief",
      authorRole: "Editorial",
      readMins: estimateReadMins(body || String(row.summary || "")),
      imageUrl: row.image_url ? String(row.image_url) : null,
      sourceName: row.source_name ? String(row.source_name) : null,
      sourceUrl: row.source_url ? String(row.source_url) : null,
    };
  });
}

async function exportDbEssays(): Promise<ArticleOut[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("gan_essays")
    .select(
      "id,title,slug,summary,body,category,tags,published_at,image_url,status,read_time,byline,author_bio",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(200);

  if (error || !data?.length) {
    if (error) console.warn("DB essay export:", error.message);
    return [];
  }

  return data.map((row) => ({
    id: String(row.id),
    type: "essay" as const,
    title: String(row.title),
    slug: String(row.slug),
    summary: String(row.summary || "").slice(0, 280),
    body: String(row.body || ""),
    category: String(row.category || "Analysis"),
    tags: Array.isArray(row.tags)
      ? [...row.tags.map(String), "essay"]
      : ["essay"],
    publishedAt: row.published_at
      ? new Date(row.published_at).toISOString()
      : new Date().toISOString(),
    author: String(row.byline || "Shiv Shakti Mishra"),
    authorRole: "Founder & Editor",
    readMins:
      Number(row.read_time) || estimateReadMins(String(row.body || "")),
    imageUrl: row.image_url ? String(row.image_url) : null,
    sourceName: null,
    sourceUrl: null,
  }));
}

function mergeBySlug(primary: ArticleOut[], secondary: ArticleOut[]): ArticleOut[] {
  const map = new Map<string, ArticleOut>();
  for (const item of secondary) map.set(item.slug, item);
  for (const item of primary) map.set(item.slug, item);
  return [...map.values()].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

function copyFounderImage() {
  const src = path.join(
    GAN_ROOT,
    "public",
    "images",
    "founders",
    "shiv-shakti-mishra.png",
  );
  const destDir = path.join(IAB_ROOT, "public", "images", "founders");
  const dest = path.join(destDir, "shiv-shakti-mishra.png");
  if (!fs.existsSync(src)) {
    console.warn("Founder image not found at", src);
    return;
  }
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log("Copied founder image →", dest);
}

async function main() {
  if (!fs.existsSync(GAN_ROOT)) {
    throw new Error(`GAN root not found: ${GAN_ROOT}`);
  }

  const diskEssays = exportEssaysFromDisk();
  const dbEssays = await exportDbEssays();
  const essays = mergeBySlug(dbEssays, diskEssays);
  const stories = await exportStoriesFromSupabase();

  const outDir = path.join(IAB_ROOT, "src", "content", "data");
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, "essays.json"),
    JSON.stringify(essays, null, 2),
  );
  fs.writeFileSync(
    path.join(outDir, "stories.json"),
    JSON.stringify(stories, null, 2),
  );
  fs.writeFileSync(
    path.join(outDir, "articles.json"),
    JSON.stringify([...essays, ...stories], null, 2),
  );

  copyFounderImage();

  console.log(
    `Exported ${essays.length} essays + ${stories.length} India briefings → src/content/data/`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
