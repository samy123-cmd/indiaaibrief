import type { PolicyJurisdiction, PolicyUpdate, Startup } from "@/types";
import {
  INDIA_AI_POLICIES,
  uniquePolicySectors as uniqueSectorsFromPolicies,
} from "@/lib/india-policies";

/** @deprecated Prefer Startup — kept for gradual migration. */
export type SeedStartup = Startup;

export type SeedPolicyUpdate = PolicyUpdate;

/** @deprecated Import INDIA_AI_POLICIES from @/lib/india-policies */
export const SEED_POLICY_UPDATES: PolicyUpdate[] = INDIA_AI_POLICIES;

/** Static seed data for Startup Tracker until Sanity population. */
export const SEED_STARTUPS: Startup[] = [
  {
    slug: "sarvam-ai",
    name: "Sarvam AI",
    logo: "/images/startups/sarvam-ai.svg",
    city: "Bengaluru",
    sector: "Foundation models",
    stage: "Series A",
    lastFunding: "₹300 Cr",
    lastFundingDate: "2026-05-12",
    lastFundingAmountInr: 3_000_000_000,
    employees: "51–200",
    foundedYear: 2023,
    website: "https://www.sarvam.ai",
    summary:
      "Indic foundation models and voice stack for Indian enterprise and government workloads.",
    tags: ["indic", "llm", "voice"],
  },
  {
    slug: "krutrim",
    name: "Krutrim",
    logo: "/images/startups/krutrim.svg",
    city: "Bengaluru",
    sector: "LLMs / Cloud",
    stage: "Series B",
    lastFunding: "₹850 Cr",
    lastFundingDate: "2026-04-28",
    lastFundingAmountInr: 8_500_000_000,
    employees: "201–500",
    foundedYear: 2023,
    website: "https://www.olakrutrim.com",
    summary:
      "Ola’s AI cloud and multilingual models targeting consumer and enterprise India.",
    tags: ["cloud", "llm", "multilingual"],
  },
  {
    slug: "gnani-ai",
    name: "Gnani.ai",
    logo: "/images/startups/gnani-ai.svg",
    city: "Bengaluru",
    sector: "Conversational AI",
    stage: "Series B",
    lastFunding: "₹120 Cr",
    lastFundingDate: "2026-03-15",
    lastFundingAmountInr: 1_200_000_000,
    employees: "201–500",
    foundedYear: 2016,
    website: "https://www.gnani.ai",
    summary:
      "Voice and conversational AI for contact centers across Indian languages.",
    tags: ["voice", "cx", "bfsi"],
  },
  {
    slug: "yellow-ai",
    name: "Yellow.ai",
    logo: "/images/startups/yellow-ai.svg",
    city: "San Mateo / Bengaluru",
    sector: "Enterprise CX AI",
    stage: "Series C",
    lastFunding: "₹165 Cr",
    lastFundingDate: "2026-02-20",
    lastFundingAmountInr: 1_650_000_000,
    employees: "501–1000",
    foundedYear: 2016,
    website: "https://yellow.ai",
    summary:
      "Multilingual enterprise CX automation with strong India and SEA footprint.",
    tags: ["cx", "chatbot", "enterprise"],
  },
  {
    slug: "observe-ai",
    name: "Observe.AI",
    logo: "/images/startups/observe-ai.svg",
    city: "Bengaluru / Redwood City",
    sector: "Contact center AI",
    stage: "Series C",
    lastFunding: "₹200 Cr",
    lastFundingDate: "2026-01-30",
    lastFundingAmountInr: 2_000_000_000,
    employees: "201–500",
    foundedYear: 2017,
    website: "https://www.observe.ai",
    summary:
      "Agent assist and conversation intelligence for large contact-center operations.",
    tags: ["cx", "qa", "speech"],
  },
  {
    slug: "fractal-analytics",
    name: "Fractal Analytics",
    logo: "/images/startups/fractal.svg",
    city: "Mumbai",
    sector: "Enterprise AI / Analytics",
    stage: "Series E",
    lastFunding: "₹560 Cr",
    lastFundingDate: "2025-11-08",
    lastFundingAmountInr: 5_600_000_000,
    employees: "1001+",
    foundedYear: 2000,
    website: "https://fractal.ai",
    summary:
      "AI and analytics for Fortune 500 and Indian enterprises across BFSI and CPG.",
    tags: ["analytics", "enterprise", "bfsi"],
  },
  {
    slug: "niramai",
    name: "Niramai",
    logo: "/images/startups/niramai.svg",
    city: "Bengaluru",
    sector: "HealthTech AI",
    stage: "Series B",
    lastFunding: "₹85 Cr",
    lastFundingDate: "2026-02-05",
    lastFundingAmountInr: 850_000_000,
    employees: "51–200",
    foundedYear: 2016,
    website: "https://www.niramai.com",
    summary:
      "Thermal imaging + AI for non-invasive breast health screening in India.",
    tags: ["health", "imaging", "diagnostics"],
  },
  {
    slug: "cropin",
    name: "Cropin",
    logo: "/images/startups/cropin.svg",
    city: "Bengaluru",
    sector: "AgriTech AI",
    stage: "Series C",
    lastFunding: "₹140 Cr",
    lastFundingDate: "2025-12-18",
    lastFundingAmountInr: 1_400_000_000,
    employees: "201–500",
    foundedYear: 2010,
    website: "https://www.cropin.com",
    summary:
      "Farm digitisation and predictive agri intelligence for Indian and global growers.",
    tags: ["agri", "satellite", "saas"],
  },
  {
    slug: "devrev",
    name: "DevRev",
    logo: "/images/startups/devrev.svg",
    city: "Bengaluru / Palo Alto",
    sector: "Product AI / Support",
    stage: "Series B",
    lastFunding: "₹420 Cr",
    lastFundingDate: "2026-06-02",
    lastFundingAmountInr: 4_200_000_000,
    employees: "201–500",
    foundedYear: 2021,
    website: "https://devrev.ai",
    summary:
      "AI-native product and support platform connecting customers, engineers, and tickets.",
    tags: ["support", "product", "saas"],
  },
  {
    slug: "dhee-ai",
    name: "Dhee.AI",
    logo: "/images/startups/dhee-ai.svg",
    city: "Chennai",
    sector: "Conversational AI",
    stage: "Series A",
    lastFunding: "₹45 Cr",
    lastFundingDate: "2026-03-28",
    lastFundingAmountInr: 450_000_000,
    employees: "51–200",
    foundedYear: 2017,
    website: "https://dhee.ai",
    summary:
      "Multilingual voice bots for Indian BFSI and telecom contact centres.",
    tags: ["voice", "bfsi", "indic"],
  },
  {
    slug: "hasura",
    name: "Hasura",
    logo: "/images/startups/hasura.svg",
    city: "Bengaluru / San Francisco",
    sector: "Data / API platform",
    stage: "Series C",
    lastFunding: "₹830 Cr",
    lastFundingDate: "2025-09-14",
    lastFundingAmountInr: 8_300_000_000,
    employees: "201–500",
    foundedYear: 2017,
    website: "https://hasura.io",
    summary:
      "Instant GraphQL and data access layer used by Indian and global product teams.",
    tags: ["data", "api", "infra"],
  },
  {
    slug: "chargebee",
    name: "Chargebee",
    logo: "/images/startups/chargebee.svg",
    city: "Chennai / San Francisco",
    sector: "Billing / Fintech SaaS",
    stage: "Series H",
    lastFunding: "₹2,000 Cr",
    lastFundingDate: "2025-08-01",
    lastFundingAmountInr: 20_000_000_000,
    employees: "1001+",
    foundedYear: 2011,
    website: "https://www.chargebee.com",
    summary:
      "Subscription billing and revenue ops — adding AI for dunning and expansion.",
    tags: ["billing", "saas", "fintech"],
  },
  {
    slug: "clear",
    name: "Clear",
    logo: "/images/startups/clear-tax.svg",
    city: "Bengaluru",
    sector: "TaxTech / Fintech AI",
    stage: "Series C",
    lastFunding: "₹1,200 Cr",
    lastFundingDate: "2026-01-10",
    lastFundingAmountInr: 12_000_000_000,
    employees: "1001+",
    foundedYear: 2011,
    website: "https://cleartax.in",
    summary:
      "Tax, compliance, and invoice intelligence for Indian businesses and consumers.",
    tags: ["tax", "compliance", "fintech"],
  },
  {
    slug: "smallcase",
    name: "smallcase",
    logo: "/images/startups/smallcase.svg",
    city: "Bengaluru",
    sector: "WealthTech AI",
    stage: "Series C",
    lastFunding: "₹300 Cr",
    lastFundingDate: "2025-10-22",
    lastFundingAmountInr: 3_000_000_000,
    employees: "201–500",
    foundedYear: 2015,
    website: "https://www.smallcase.com",
    summary:
      "Thematic investing platform using data and AI for retail portfolio construction.",
    tags: ["wealth", "retail", "fintech"],
  },
  {
    slug: "lenskart",
    name: "Lenskart",
    logo: "/images/startups/lenskart.svg",
    city: "Gurugram",
    sector: "Retail / Computer vision",
    stage: "Series I",
    lastFunding: "₹1,600 Cr",
    lastFundingDate: "2026-04-05",
    lastFundingAmountInr: 16_000_000_000,
    employees: "1001+",
    foundedYear: 2010,
    website: "https://www.lenskart.com",
    summary:
      "Omnichannel eyewear with AI try-on, prescription, and supply-chain tooling.",
    tags: ["retail", "vision", "consumer"],
  },
];

/** Static seed data for Policy Tracker until Sanity population. */
export const POLICY_JURISDICTIONS: PolicyJurisdiction[] = [
  "central",
  "state",
];

export function uniqueStartupCities(startups: Startup[] = SEED_STARTUPS): string[] {
  return Array.from(new Set(startups.map((s) => s.city))).sort();
}

export function uniqueStartupSectors(
  startups: Startup[] = SEED_STARTUPS,
): string[] {
  return Array.from(new Set(startups.map((s) => s.sector))).sort();
}

export function uniqueStartupStages(
  startups: Startup[] = SEED_STARTUPS,
): string[] {
  return Array.from(new Set(startups.map((s) => s.stage))).sort();
}

export function uniquePolicySectors(
  updates: PolicyUpdate[] = SEED_POLICY_UPDATES,
): string[] {
  return uniqueSectorsFromPolicies(updates);
}

export function getStartupBySlug(slug: string): Startup | null {
  return SEED_STARTUPS.find((startup) => startup.slug === slug) ?? null;
}
