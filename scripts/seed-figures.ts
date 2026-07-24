/**
 * Seed live figures used by <FigureTable /> / <Figure />.
 *
 *   npx tsx scripts/seed-figures.ts
 */
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema";
import { parseDatabaseUrl } from "../lib/db-url";

const asOf = new Date("2026-07-01T00:00:00+05:30");

const FIGURES: (typeof schema.figures.$inferInsert)[] = [
  // Market size
  {
    key: "india_ai_market_opportunity",
    label: "India AI market opportunity",
    value: "Multi-billion USD by end of decade (software + services + infra)",
    groupKey: "india_market_size",
    category: "market",
    sourceName: "NASSCOM",
    sortOrder: 1,
    asOfDate: asOf,
  },
  {
    key: "genai_software_spend_growth",
    label: "GenAI software spend growth",
    value: "High double-digit CAGR in early forecast windows",
    groupKey: "india_market_size",
    category: "market",
    sourceName: "IDC India",
    sortOrder: 2,
    asOfDate: asOf,
  },
  {
    key: "ai_itbpm_export_uplift",
    label: "AI-tagged IT/BPM export uplift",
    value: "Growing faster than legacy application stacks",
    groupKey: "india_market_size",
    category: "market",
    sourceName: "NASSCOM",
    sortOrder: 3,
    asOfDate: asOf,
  },
  {
    key: "domestic_ai_saas_attach",
    label: "Domestic AI SaaS attach rate",
    value: "Rising share of new B2B product features shipping AI",
    groupKey: "india_market_size",
    category: "market",
    sourceName: "Deloitte India",
    sortOrder: 4,
    asOfDate: asOf,
  },
  {
    key: "apac_ai_spend_vs_global",
    label: "APAC AI spend growth vs global",
    value: "Among fastest regional growth rates",
    groupKey: "india_market_size",
    category: "market",
    sourceName: "IDC India",
    sortOrder: 5,
    asOfDate: asOf,
  },
  {
    key: "india_share_ai_services",
    label: "India share of global AI services delivery",
    value: "Outsized vs share of frontier model labs",
    groupKey: "india_market_size",
    category: "market",
    sourceName: "NASSCOM",
    sortOrder: 6,
    asOfDate: asOf,
  },
  {
    key: "ai_consulting_revenue_growth",
    label: "AI consulting / transformation revenue",
    value: "Double-digit growth in Big-4 India AI practices",
    groupKey: "india_market_size",
    category: "market",
    sourceName: "PwC India",
    sortOrder: 7,
    asOfDate: asOf,
  },
  {
    key: "cloud_gpu_demand_metros",
    label: "Cloud AI / GPU capacity demand in metros",
    value: "Supply-constrained in Mumbai, Hyderabad, Chennai, NCR",
    groupKey: "india_market_size",
    category: "market",
    sourceName: "Gartner",
    sortOrder: 8,
    asOfDate: asOf,
  },
  // Adoption
  {
    key: "large_enterprises_ai_eval",
    label: "Large Indian enterprises evaluating or deploying AI",
    value: "Majority in Deloitte / Big-4 India survey waves",
    groupKey: "india_adoption",
    category: "adoption",
    sourceName: "Deloitte India",
    sortOrder: 1,
    asOfDate: asOf,
  },
  {
    key: "gcc_genai_pilots",
    label: "GCCs piloting genAI productivity tools",
    value: "Majority of large GCCs in recent cohorts",
    groupKey: "india_adoption",
    category: "adoption",
    sourceName: "NASSCOM GCC",
    sortOrder: 2,
    asOfDate: asOf,
  },
  {
    key: "tier1_it_ai_offerings",
    label: "Tier-1 IT majors with packaged AI offerings",
    value: "Near-universal among top Indian IT exporters",
    groupKey: "india_adoption",
    category: "adoption",
    sourceName: "NASSCOM",
    sortOrder: 3,
    asOfDate: asOf,
  },
  {
    key: "bfsi_production_usecase",
    label: "BFSI firms with AI in at least one production use case",
    value: "Fraud, KYC assist, and service copilots lead",
    groupKey: "india_adoption",
    category: "adoption",
    sourceName: "KPMG India",
    sortOrder: 4,
    asOfDate: asOf,
  },
  {
    key: "midmarket_pilot_stage",
    label: "Mid-market India firms stuck in pilot stage",
    value: "Large minority report pilots without scaled ROI",
    groupKey: "india_adoption",
    category: "adoption",
    sourceName: "EY India",
    sortOrder: 5,
    asOfDate: asOf,
  },
  {
    key: "consumer_chatbot_awareness",
    label: "Consumer AI chatbot awareness in urban India",
    value: "High awareness; monetisation still early",
    groupKey: "india_adoption",
    category: "adoption",
    sourceName: "Google India",
    sortOrder: 6,
    asOfDate: asOf,
  },
  {
    key: "coding_assistants_gcc",
    label: "Developer use of coding assistants in India GCCs",
    value: "Rapid uptake in engineering orgs",
    groupKey: "india_adoption",
    category: "adoption",
    sourceName: "Microsoft India",
    sortOrder: 7,
    asOfDate: asOf,
  },
  {
    key: "open_weight_enterprise_trials",
    label: "Open-weight / Llama-class trials in enterprises",
    value: "Growing for cost and on-prem preferences",
    groupKey: "india_adoption",
    category: "adoption",
    sourceName: "Meta",
    sortOrder: 8,
    asOfDate: asOf,
  },
  // Investment
  {
    key: "indiaai_mission_budget",
    label: "IndiaAI Mission approved budget",
    value: "₹10,371+ crore",
    groupKey: "india_investment",
    category: "funding",
    sourceName: "MeitY / IndiaAI",
    sourceUrl: "https://indiaai.gov.in/",
    sortOrder: 1,
    asOfDate: asOf,
  },
  {
    key: "indiaai_gpu_cluster_target",
    label: "IndiaAI compute / GPU cluster target",
    value: "10,000+ GPUs for shared domestic access",
    groupKey: "india_investment",
    category: "funding",
    sourceName: "MeitY / IndiaAI",
    sortOrder: 2,
    asOfDate: asOf,
  },
  {
    key: "india_ai_startup_funding",
    label: "India AI startup funding (recent cycles)",
    value: "Multi-billion USD cumulative across cycles",
    groupKey: "india_investment",
    category: "funding",
    sourceName: "Inc42 / Tracxn",
    sortOrder: 3,
    asOfDate: asOf,
  },
  {
    key: "share_tech_funding_ai",
    label: "Share of India tech funding tagged AI/ML",
    value: "Elevated vs pre-2023 baseline",
    groupKey: "india_investment",
    category: "funding",
    sourceName: "Tracxn",
    sortOrder: 4,
    asOfDate: asOf,
  },
  {
    key: "late_stage_ai_scarcity",
    label: "Late-stage India AI round scarcity",
    value: "Fewer mega-rounds vs US; denser seed/Series A",
    groupKey: "india_investment",
    category: "funding",
    sourceName: "YourStory",
    sortOrder: 5,
    asOfDate: asOf,
  },
  {
    key: "corporate_strategic_ai",
    label: "Corporate / strategic AI investment",
    value: "Hyperscaler + IT major participation rising",
    groupKey: "india_investment",
    category: "funding",
    sourceName: "Bain",
    sortOrder: 6,
    asOfDate: asOf,
  },
  {
    key: "public_sector_ai_rfp",
    label: "Public-sector AI RFP / tender language",
    value: "Rising auditability and sovereign options",
    groupKey: "india_investment",
    category: "funding",
    sourceName: "MeitY / IndiaAI",
    sortOrder: 7,
    asOfDate: asOf,
  },
  {
    key: "private_cloud_ai_capex",
    label: "Private cloud / AI infra capex",
    value: "Material uplift in BFSI and telecom budgets",
    groupKey: "india_investment",
    category: "funding",
    sourceName: "Gartner",
    sortOrder: 8,
    asOfDate: asOf,
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

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

  console.log("Upserting figures…");
  for (const figure of FIGURES) {
    await db
      .insert(schema.figures)
      .values(figure)
      .onConflictDoUpdate({
        target: schema.figures.key,
        set: {
          label: figure.label,
          value: figure.value,
          groupKey: figure.groupKey,
          category: figure.category,
          sourceName: figure.sourceName,
          sourceUrl: figure.sourceUrl ?? null,
          sortOrder: figure.sortOrder,
          asOfDate: figure.asOfDate,
          updatedAt: new Date(),
          isActive: true,
        },
      });
  }

  console.log(`Seeded ${FIGURES.length} figures.`);
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
