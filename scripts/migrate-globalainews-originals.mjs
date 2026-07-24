/**
 * Migrate Global AI News authority-series originals → indiaaibrief MDX.
 * Skips _template.md and RSS briefs.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE_ROOT = path.join(
  "C:",
  "Users",
  "pmish",
  "Downloads",
  "news-website-main",
  "news-website-main",
  "content",
  "authority-series",
);
const DEST_ROOT = path.join(process.cwd(), "content");
const IMAGE_ROOT = path.join(process.cwd(), "public", "images", "articles");

/** @typedef {"news"|"explains"|"compares"|"playbooks"|"data"} Category */

/** @type {Record<string, { category: Category, featured?: boolean, trending?: boolean, tags: string[] }>} */
const OVERRIDES = {
  "how-to-build-ai-startup-india": {
    category: "playbooks",
    featured: true,
    trending: true,
    tags: ["india", "startups", "playbook", "founders", "dpdp"],
  },
  "future-work-ai-indian-it": {
    category: "explains",
    featured: true,
    trending: true,
    tags: ["india", "it-services", "jobs", "workforce"],
  },
  "ai-regulation-india-business-guide": {
    category: "explains",
    featured: true,
    trending: true,
    tags: ["india", "regulation", "meity", "dpdp", "compliance"],
  },
  "india-strategy": {
    category: "explains",
    featured: true,
    trending: false,
    tags: ["india", "policy", "indiaai", "sovereign-ai"],
  },
  "complete-guide-ai-agents-2026": {
    category: "explains",
    featured: false,
    trending: true,
    tags: ["agents", "research", "architecture"],
  },
};

/** @type {Record<string, string>} */
const SLUG_ALIASES = {
  "03_china_control": "china-algorithmic-control",
  "04_india_strategy": "india-ai-strategy-sovereign-safety",
  "12_ai_regulation_india_business_guide": "ai-regulation-india-business-guide",
  "15_how_to_build_ai_startup_india": "how-to-build-ai-startup-india",
  "16_future_work_ai_indian_it": "future-work-ai-indian-it",
  "27_complete_guide_ai_agents_2026": "complete-guide-ai-agents-2026",
};

function filenameToSlug(filename) {
  const base = filename.replace(/\.md$/, "");
  if (SLUG_ALIASES[base]) return SLUG_ALIASES[base];
  return base.replace(/^\d+_/, "").replace(/_/g, "-");
}

function seriesDefaultCategory(series) {
  if (series === "industry") return "explains";
  if (series === "regulation") return "explains";
  return "explains";
}

function seriesTags(series) {
  if (series === "industry") return ["industry", "authority-series"];
  if (series === "regulation") return ["regulation", "policy", "authority-series"];
  return ["research", "authority-series"];
}

function extractField(body, label) {
  const re = new RegExp(`\\*\\*${label}\\*\\*:\\s*([\\s\\S]*?)(?=\\n\\n|\\n\\*\\*|\\n\\*|\\n#|$)`, "i");
  const m = body.match(re);
  return m ? m[1].trim().replace(/\n+/g, " ") : "";
}

function extractTitle(body) {
  const m = body.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : "Untitled";
}

function extractUpdated(body) {
  const m = body.match(/\*Last Updated:\s*(.+?)\*/i);
  if (!m) return "2026-07-22T10:00:00+05:30";
  const d = new Date(`${m[1].trim()} 12:00:00 GMT+0530`);
  if (Number.isNaN(d.getTime())) return "2026-07-22T10:00:00+05:30";
  return d.toISOString().replace("Z", "+05:30");
}

function stripHeader(body) {
  let text = body;
  text = text.replace(/^#\s+.+\n+/, "");
  text = text.replace(/\*\*Summary\*\*:[\s\S]*?(?=\n---|\n##|\n\*\*Bottom)/i, "");
  text = text.replace(/\*\*Bottom line\*\*:[\s\S]*?(?=\n---|\n##|\n)/i, "");
  text = text.replace(/\*Last Updated:[\s\S]*?\*\n*/i, "");
  text = text.replace(/^---\s*\n+/m, "");
  return text.trim();
}

function rewriteLinks(text) {
  let out = text;
  out = out.replace(/Global AI News/gi, "IndiaAIBrief");
  out = out.replace(
    /\/article\/[a-f0-9-]+\/([a-z0-9-]+)/gi,
    (_m, slug) => {
      const map = {
        "ai-regulation-india-business-guide": "/explains/ai-regulation-india-business-guide",
        "complete-guide-ai-agents-2026": "/explains/complete-guide-ai-agents-2026",
        "how-to-build-ai-startup-india": "/playbooks/how-to-build-ai-startup-india",
        "future-work-ai-indian-it": "/explains/future-work-ai-indian-it",
      };
      return map[slug] ?? `/explains/${slug}`;
    },
  );
  out = out.replace(
    /\/authority-series\/(regulation|industry|research)\/(\d+_[a-z0-9_]+)/gi,
    (_m, series, file) => {
      const slug = filenameToSlug(`${file}.md`);
      const cat =
        OVERRIDES[slug]?.category ?? seriesDefaultCategory(series);
      return `/${cat}/${slug}`;
    },
  );
  out = out.replace(
    /\/ai-industry-statistics-2026/gi,
    "/data/ai-in-india-market-statistics-2026",
  );
  out = out.replace(
    /\/generative-ai-adoption-statistics/gi,
    "/data/ai-in-india-market-statistics-2026",
  );
  // Only rewrite bare stats path if not already under /data/
  out = out.replace(
    /(?<!\/data)\/ai-in-india-market-statistics-2026/gi,
    "/data/ai-in-india-market-statistics-2026",
  );
  out = out.replace(/\/deep-dives/gi, "/explains");
  out = out.replace(/\/india-watch/gi, "/news");
  return out;
}

function ensureAnswerFirst(body, summary, bottomLine, audienceLabel) {
  const answerText = (bottomLine || summary).slice(0, 400);
  const context =
    summary && bottomLine && summary !== bottomLine
      ? summary
      : "This brief was originally published as an IndiaAIBrief / Global AI News editorial deep dive — preserved here with India-first framing for founders, CTOs, and policymakers.";

  let content = body;
  // Soft-wrap: if no FAQ heading, append a minimal FAQ
  if (!/frequently asked questions/i.test(content)) {
    content += `

## Frequently Asked Questions

### Who is this for?

Indian founders, CTOs, MSME operators, and policymakers who need a direct answer — not an aggregator roundup.

### Is this original analysis?

Yes. This piece was written as an original editorial essay (authority series), not an RSS rewrite.

### Where should I go next?

Explore related [explainers](/explains), [playbooks](/playbooks), and the [AI Compliance Starter Kit](/kit/ai-compliance).
`;
  }

  // Ensure key H2s exist loosely — insert if missing What Changed / Details / Means
  const hasDetails = /##\s+The Details/i.test(content) || /##\s+/.test(content);
  if (!hasDetails) {
    content = `## The Details\n\n${content}`;
  }

  if (!/##\s+What This Means/i.test(content)) {
    content += `

## What This Means for ${audienceLabel}

Use this as a decision brief: extract the actions that change your stack, compliance posture, or GTM this quarter. Link it into your internal AI use-case register and vendor diligence pack.
`;
  }

  return `<Answer>
${answerText}
</Answer>

${context}

## What Changed

- Original editorial analysis migrated from the Global AI News authority series to IndiaAIBrief.
- Framed for Indian decision-makers: founders, CTOs, MSMEs, and policymakers.
- Internal links updated to indiaaibrief.com routes; compliance CTAs point to the [AI Compliance Starter Kit](/kit/ai-compliance).

${content}`;
}

function yamlEscape(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function wordCount(s) {
  return s.split(/\s+/).filter(Boolean).length;
}

async function makeHero(slug, title, color) {
  const file = path.join(IMAGE_ROOT, `${slug}.webp`);
  if (fs.existsSync(file)) return `/images/articles/${slug}.webp`;
  const label = title.length > 48 ? `${title.slice(0, 45)}…` : title;
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color}"/><stop offset="100%" stop-color="#0A0A0A"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="56" y="320" fill="#FAFAFA" font-family="Segoe UI, Arial" font-size="40" font-weight="700">${label.replace(/[<>&]/g, "")}</text>
  </svg>`);
  await sharp(svg).webp({ quality: 78 }).toFile(file);
  return `/images/articles/${slug}.webp`;
}

const COLORS = ["#DC2626", "#B91C1C", "#7F1D1D", "#991B1B", "#450A0A"];

async function convertFile(series, filename, index) {
  const src = path.join(SOURCE_ROOT, series, filename);
  const raw = fs.readFileSync(src, "utf8");
  const slug = filenameToSlug(filename);
  const override = OVERRIDES[slug];
  const category = override?.category ?? seriesDefaultCategory(series);
  const title = extractTitle(raw);
  const summary = extractField(raw, "Summary");
  const bottomLine = extractField(raw, "Bottom line");
  const publishedAt = extractUpdated(raw);
  const bodyCore = rewriteLinks(stripHeader(raw));
  const audience =
    category === "playbooks"
      ? "Indian Founders"
      : series === "regulation"
        ? "CTOs and Compliance Leads"
        : "Indian Decision-Makers";

  const body = ensureAnswerFirst(bodyCore, summary, bottomLine, audience);
  const description = (summary || bottomLine || title).slice(0, 160);
  const excerpt = (bottomLine || summary || description).slice(0, 150);
  const tags = Array.from(
    new Set([...(override?.tags ?? []), ...seriesTags(series), "original"]),
  );
  const image = await makeHero(slug, title, COLORS[index % COLORS.length]);
  const readingTime = Math.max(4, Math.ceil(wordCount(body) / 200));

  const faqs = [
    {
      question: `What is the key takeaway from “${title.slice(0, 60)}”?`,
      answer: (bottomLine || summary || description).slice(0, 300),
    },
    {
      question: "Is this original IndiaAIBrief analysis?",
      answer:
        "Yes. This essay was originally published in the Global AI News authority series and migrated as an original editorial asset — not an RSS aggregation.",
    },
    {
      question: "How should Indian MSMEs use this?",
      answer:
        "Treat it as a decision brief: extract actions for compliance, GTM, or stack choices this quarter, and pair it with the AI Compliance Starter Kit where relevant.",
    },
  ];

  const fm = `---
title: ${JSON.stringify(title.slice(0, 60))}
description: ${JSON.stringify(description)}
publishedAt: "${publishedAt}"
modifiedAt: "${publishedAt}"
author: "indiaaibrief-desk"
category: "${category}"
tags: [${tags.map((t) => JSON.stringify(t)).join(", ")}]
image: "${image}"
imageAlt: ${JSON.stringify(`Editorial graphic for ${title}`)}
featured: ${override?.featured ? "true" : "false"}
trending: ${override?.trending ? "true" : "false"}
readingTime: ${readingTime}
excerpt: ${JSON.stringify(excerpt)}
structuredData:
  type: "Article"
  faq:
${faqs
  .map(
    (f) =>
      `    - question: ${JSON.stringify(f.question)}\n      answer: ${JSON.stringify(f.answer)}`,
  )
  .join("\n")}
---

`;

  const destDir = path.join(DEST_ROOT, category);
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, `${slug}.mdx`);
  fs.writeFileSync(dest, `${fm}${body}\n`, "utf8");
  return { category, slug, title, dest };
}

async function main() {
  fs.mkdirSync(IMAGE_ROOT, { recursive: true });
  const seriesList = ["industry", "regulation", "research"];
  const results = [];
  let i = 0;

  for (const series of seriesList) {
    const dir = path.join(SOURCE_ROOT, series);
    if (!fs.existsSync(dir)) {
      console.error("Missing source:", dir);
      continue;
    }
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
      .sort();
    for (const file of files) {
      const result = await convertFile(series, file, i++);
      results.push(result);
      console.log(`✓ ${result.category}/${result.slug}`);
    }
  }

  console.log(`\nMigrated ${results.length} original essays.`);
}

await main();
