/**
 * Seed editorial sources + sample signals.
 *
 *   npx tsx scripts/seed-editorial.ts
 *
 * Requires DATABASE_URL (Supabase Postgres connection string).
 * Apply drizzle/migrations/0000_editorial_pipeline.sql first.
 */
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema";
import { parseDatabaseUrl } from "../lib/db-url";

const SAMPLE_DRAFT = `<Answer>
MeitY's latest AI governance guidance tightens expectations for Indian enterprises deploying high-risk AI systems, with clearer accountability for model providers and deployers operating in India.
</Answer>

India-specific compliance pressure is rising as MSMEs and enterprises adopt generative AI without dedicated legal teams.

## What Changed

- New governance expectations for AI deployers in India
- Stronger alignment with DPDP Act obligations
- Clearer pathway for IndiaAI Mission participants

## The Details

Primary source attribution and further reading should link the official release.

## What This Means for Indian Founders and CTOs

- Budget for compliance reviews before enterprise sales
- Prefer vendors with India data residency options
- Compare against Sarvam, Krutrim, and open Indic stacks where relevant

## Frequently Asked Questions

### Does this affect startups under 50 employees?

Yes — deployer obligations typically scale with risk class, not headcount alone.

### Is this a ban on generative AI?

No. It is a governance framework, not a prohibition.
`;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required");
  }

  const cfg = parseDatabaseUrl(url);
  const client = postgres({
    host: cfg.host,
    port: cfg.port,
    database: cfg.database,
    user: cfg.user,
    password: cfg.password,
    ssl: "require",
    prepare: false,
    max: 1,
  });
  const db = drizzle(client, { schema });

  console.log("Seeding sources...");

  const sourceRows: (typeof schema.sources.$inferInsert)[] = [
    {
      name: "MeitY Press Releases",
      url: "https://www.meity.gov.in/content/press-releases",
      type: "scrape",
      category: "policy",
      fetchFrequency: "6hours",
      config: {
        selectors: {
          item: ".views-row, article, .press-release",
          title: "a, h2, h3",
          link: "a",
          summary: "p",
        },
        indiaFilter: true,
      },
    },
    {
      name: "Inc42 AI",
      url: "https://inc42.com/tag/artificial-intelligence/feed/",
      type: "rss",
      category: "funding",
      fetchFrequency: "15min",
      config: { feedUrl: "https://inc42.com/tag/artificial-intelligence/feed/" },
    },
    {
      name: "OpenAI Blog",
      url: "https://openai.com/blog/rss.xml",
      type: "rss",
      category: "product_launch",
      fetchFrequency: "1hour",
      config: { feedUrl: "https://openai.com/blog/rss.xml" },
    },
    {
      name: "Google AI Blog",
      url: "https://blog.google/technology/ai/rss/",
      type: "rss",
      category: "product_launch",
      fetchFrequency: "1hour",
      config: { feedUrl: "https://blog.google/technology/ai/rss/" },
    },
    {
      name: "AI4Bharat",
      url: "https://ai4bharat.org/",
      type: "scrape",
      category: "research",
      fetchFrequency: "6hours",
      config: {
        selectors: { item: "article, .card, li", title: "a, h2, h3", link: "a" },
        indiaFilter: true,
      },
    },
    {
      name: "Sarvam AI",
      url: "https://www.sarvam.ai/blog",
      type: "scrape",
      category: "product_launch",
      fetchFrequency: "6hours",
      config: {
        selectors: { item: "article, .post", title: "a, h2", link: "a" },
        indiaFilter: true,
      },
    },
    {
      name: "Analytics India Magazine",
      url: "https://analyticsindiamag.com/feed/",
      type: "rss",
      category: "opportunity",
      fetchFrequency: "15min",
      config: { feedUrl: "https://analyticsindiamag.com/feed/" },
    },
    {
      name: "NASSCOM",
      url: "https://nasscom.in/news-and-events",
      type: "scrape",
      category: "policy",
      fetchFrequency: "daily",
      config: {
        selectors: { item: "article, .views-row", title: "a, h2", link: "a" },
        indiaFilter: true,
      },
    },
    {
      name: "YourStory AI",
      url: "https://yourstory.com/tag/artificial-intelligence/rss",
      type: "rss",
      category: "funding",
      fetchFrequency: "1hour",
      config: {
        feedUrl: "https://yourstory.com/tag/artificial-intelligence/rss",
      },
    },
    {
      name: "Tracxn India AI",
      url: "https://tracxn.com/d/companies/sectors/artificial-intelligence--india",
      type: "manual",
      category: "funding",
      fetchFrequency: "daily",
      config: { note: "Paid API placeholder — use manual ingest for tips" },
    },
  ];

  // Clear-and-seed is intentional for local/dev seed runs
  await db.delete(schema.auditLogs);
  await db.delete(schema.editorialQueue);
  await db.delete(schema.articles);
  await db.delete(schema.signals);
  await db.delete(schema.sources);

  const insertedSources = await db
    .insert(schema.sources)
    .values(sourceRows)
    .returning();

  console.log(`Inserted ${insertedSources.length} sources`);

  const now = Date.now();
  const signalDefs: Array<{
    title: string;
    source: string;
    sourceUrl: string;
    category: (typeof schema.signals.$inferInsert)["category"];
    impactLevel: (typeof schema.signals.$inferInsert)["impactLevel"];
    indiaRelevance: (typeof schema.signals.$inferInsert)["indiaRelevance"];
    status: (typeof schema.signals.$inferInsert)["status"];
    summary: string;
    withDraft?: boolean;
  }> = [
    {
      title: "MeitY releases updated AI governance framework for enterprises",
      source: "meity",
      sourceUrl: "https://www.meity.gov.in/seed/ai-governance-2026",
      category: "policy",
      impactLevel: "critical",
      indiaRelevance: "direct",
      status: "new",
      summary:
        "MeitY published updated AI governance guidance affecting Indian enterprise deployers.",
      withDraft: true,
    },
    {
      title: "Sarvam AI raises $50M Series B for Indic LLMs",
      source: "inc42",
      sourceUrl: "https://inc42.com/seed/sarvam-series-b",
      category: "funding",
      impactLevel: "critical",
      indiaRelevance: "direct",
      status: "new",
      summary: "Bengaluru-based Sarvam AI closed a $50M round for Indic models.",
      withDraft: true,
    },
    {
      title: "OpenAI cuts API prices — impact on Indian startups",
      source: "openai",
      sourceUrl: "https://openai.com/seed/api-price-cut",
      category: "product_launch",
      impactLevel: "high",
      indiaRelevance: "indirect",
      status: "new",
      summary:
        "OpenAI reduced API pricing, changing unit economics for Indian AI startups.",
    },
    {
      title: "AI4Bharat releases new Indic ASR models",
      source: "ai4bharat",
      sourceUrl: "https://ai4bharat.org/seed/indic-asr",
      category: "research",
      impactLevel: "high",
      indiaRelevance: "direct",
      status: "new",
      summary: "IIT Madras AI4Bharat open-sourced improved Indic speech models.",
      withDraft: true,
    },
    {
      title: "Karnataka IT dept launches state AI startup grant",
      source: "manual",
      sourceUrl: "https://itbt.karnataka.gov.in/seed/ai-grant",
      category: "opportunity",
      impactLevel: "high",
      indiaRelevance: "direct",
      status: "new",
      summary: "Karnataka announced grants for AI startups in Bengaluru and beyond.",
    },
    {
      title: "Krutrim expands Hindi enterprise API availability",
      source: "manual",
      sourceUrl: "https://olakrutrim.com/seed/hindi-api",
      category: "product_launch",
      impactLevel: "medium",
      indiaRelevance: "direct",
      status: "reviewing",
      summary: "Ola Krutrim opened Hindi enterprise endpoints to more customers.",
    },
    {
      title: "NASSCOM publishes AI talent report for India 2026",
      source: "nasscom",
      sourceUrl: "https://nasscom.in/seed/ai-talent-2026",
      category: "opportunity",
      impactLevel: "medium",
      indiaRelevance: "direct",
      status: "approved",
      summary: "NASSCOM estimates AI talent demand across Tier-1 and Tier-2 cities.",
    },
    {
      title: "Google DeepMind partners with Indian hospitals on diagnostics",
      source: "google_ai",
      sourceUrl: "https://blog.google/seed/india-diagnostics",
      category: "partnership",
      impactLevel: "high",
      indiaRelevance: "direct",
      status: "drafting",
      summary: "Pilot with Apollo and AIIMS-linked researchers for imaging AI.",
    },
    {
      title: "RBI consultative paper on AI in banking",
      source: "manual",
      sourceUrl: "https://rbi.org.in/seed/ai-banking",
      category: "regulation",
      impactLevel: "critical",
      indiaRelevance: "direct",
      status: "reviewing",
      summary: "RBI seeks feedback on AI risk management for Indian banks.",
    },
    {
      title: "Microsoft Azure India launches new GPU SKUs in Mumbai",
      source: "manual",
      sourceUrl: "https://azure.microsoft.com/seed/mumbai-gpu",
      category: "product_launch",
      impactLevel: "high",
      indiaRelevance: "direct",
      status: "approved",
      summary: "New NVIDIA GPU capacity in India South regions for Azure customers.",
    },
    {
      title: "YourStory: DeHaat expands AI agronomy to 5 new states",
      source: "yourstory",
      sourceUrl: "https://yourstory.com/seed/dehaat-ai",
      category: "product_launch",
      impactLevel: "medium",
      indiaRelevance: "direct",
      status: "archived",
      summary: "DeHaat rolled AI crop advisory into new Indian states.",
    },
    {
      title: "AIM covers TCS generative AI services pitch to BFSI",
      source: "analytics_india",
      sourceUrl: "https://analyticsindiamag.com/seed/tcs-bfsi-ai",
      category: "partnership",
      impactLevel: "medium",
      indiaRelevance: "direct",
      status: "rejected",
      summary: "TCS expanded GenAI offerings for Indian BFSI clients.",
    },
    {
      title: "Anthropic publishes Claude India availability update",
      source: "manual",
      sourceUrl: "https://anthropic.com/seed/claude-india",
      category: "product_launch",
      impactLevel: "medium",
      indiaRelevance: "indirect",
      status: "new",
      summary: "Claude access and policy notes affecting Indian enterprise buyers.",
    },
    {
      title: "IISc Bangalore team publishes multimodal Indic benchmark",
      source: "manual",
      sourceUrl: "https://arxiv.org/seed/iisc-indic-bench",
      category: "research",
      impactLevel: "medium",
      indiaRelevance: "direct",
      status: "new",
      summary: "New benchmark covering Hindi, Tamil, and Kannada multimodal tasks.",
    },
    {
      title: "DPIIT recognizes 200 new AI startups under Startup India",
      source: "manual",
      sourceUrl: "https://startupindia.gov.in/seed/ai-200",
      category: "policy",
      impactLevel: "medium",
      indiaRelevance: "direct",
      status: "new",
      summary: "DPIIT published a fresh cohort of AI-recognized startups.",
    },
    {
      title: "NVIDIA partners with Indian cloud providers on H100 access",
      source: "manual",
      sourceUrl: "https://nvidia.com/seed/india-h100",
      category: "partnership",
      impactLevel: "high",
      indiaRelevance: "direct",
      status: "new",
      summary: "Expanded GPU availability through Indian cloud partners.",
    },
    {
      title: "CoRover.ai launches multilingual chatbot kit for MSMEs",
      source: "manual",
      sourceUrl: "https://corover.ai/seed/msme-kit",
      category: "product_launch",
      impactLevel: "low",
      indiaRelevance: "direct",
      status: "new",
      summary: "CoRover packaged Indic chatbot tooling for MSME budgets.",
    },
    {
      title: "Global LLM eval leaderboard update with weak India angle",
      source: "manual",
      sourceUrl: "https://example.com/seed/global-evals",
      category: "research",
      impactLevel: "low",
      indiaRelevance: "global_context",
      status: "new",
      summary: "General model eval news; editors decide India angle.",
    },
    {
      title: "HDFC Bank rolls out AI-assisted loan underwriting pilot",
      source: "manual",
      sourceUrl: "https://hdfcbank.com/seed/ai-underwriting",
      category: "product_launch",
      impactLevel: "medium",
      indiaRelevance: "direct",
      status: "new",
      summary: "HDFC piloting AI underwriting in select Indian markets.",
    },
    {
      title: "Meta WhatsApp AI features expand to more Indian languages",
      source: "manual",
      sourceUrl: "https://about.fb.com/seed/whatsapp-india-ai",
      category: "product_launch",
      impactLevel: "high",
      indiaRelevance: "direct",
      status: "new",
      summary: "WhatsApp AI assistants add Tamil and Telugu support.",
    },
  ];

  const signalRows = signalDefs.map((def, index) => ({
    title: def.title,
    source: def.source,
    sourceUrl: def.sourceUrl,
    sourceType: "manual" as const,
    category: def.category,
    impactLevel: def.impactLevel,
    indiaRelevance: def.indiaRelevance,
    summary: def.summary,
    rawContent: def.summary,
    publishedAt: new Date(now - index * 3600_000),
    fetchedAt: new Date(now - index * 1800_000),
    status: def.status,
    tags: [def.category, def.indiaRelevance, "seed"],
    relatedStartups: def.title.toLowerCase().includes("sarvam")
      ? ["Sarvam"]
      : def.title.toLowerCase().includes("krutrim")
        ? ["Krutrim"]
        : [],
    relatedPolicies: def.title.toLowerCase().includes("meity")
      ? ["AI Governance"]
      : def.title.toLowerCase().includes("rbi")
        ? ["RBI AI Banking"]
        : [],
    aiDraft: def.withDraft ? SAMPLE_DRAFT : null,
    aiDraftGeneratedAt: def.withDraft ? new Date() : null,
  }));

  const insertedSignals = await db
    .insert(schema.signals)
    .values(signalRows)
    .returning();

  console.log(`Inserted ${insertedSignals.length} signals`);

  const critical = insertedSignals.filter(
    (s) => s.indiaRelevance === "direct" && s.impactLevel === "critical",
  );

  if (critical.length) {
    await db.insert(schema.editorialQueue).values(
      critical.map((s) => ({
        signalId: s.id,
        priority: 10,
        deadline: new Date(Date.now() + 4 * 3600_000),
        notes: "Seed auto-queue",
      })),
    );
  }

  console.log("Seed complete.");
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
