/**
 * India pulse figures — short, citeable hero stats (India Watch style).
 * Static fallbacks always work; DB-backed figures can override when seeded.
 */

export interface IndiaPulseStat {
  key: string;
  value: string;
  label: string;
  detail?: string;
  href?: string;
}

/** Homepage / India Watch–style hero strip */
export const INDIA_PULSE_HERO: IndiaPulseStat[] = [
  {
    key: "ai_startups",
    value: "200+",
    label: "AI startups",
    detail: "Active builders across metros & Tier-2 hubs",
    href: "/startups",
  },
  {
    key: "indiaai_mission",
    value: "₹10K Cr",
    label: "IndiaAI Mission",
    detail: "Compute, datasets, models, startup support",
    href: "/data/ai-in-india-market-statistics-2026",
  },
  {
    key: "engineers_year",
    value: "1.5M+",
    label: "Engineers / year",
    detail: "World’s largest annual STEM pipeline",
    href: "/explains",
  },
  {
    key: "ai_talent_rank",
    value: "#2",
    label: "Global AI talent",
    detail: "Talent pool outside the United States",
    href: "/data/tier-2-tier-3-cities-india-ai-economy",
  },
];

/** About-page “Why India” panel */
export const WHY_INDIA_STATS: IndiaPulseStat[] = [
  {
    key: "stem_pipeline",
    value: "1.5M+",
    label: "Engineering graduates every year",
    detail: "The world’s largest annual STEM pipeline",
  },
  {
    key: "talent_pool",
    value: "#2",
    label: "AI talent pool outside the US",
    detail: "Builders shipping models, agents, and platforms",
  },
  {
    key: "fortune_500",
    value: "90%",
    label: "Of Fortune 500 touched by Indian IT",
    detail: "TCS, Infosys, Wipro, HCL and the GCC layer",
  },
  {
    key: "mission_budget",
    value: "₹10K Cr",
    label: "IndiaAI Mission allocation",
    detail: "Compute, datasets, models, startup support",
  },
];

/** Key tracking cards (policy / buyers / language / data hub) */
export const INDIA_KEY_TRACKERS: IndiaPulseStat[] = [
  {
    key: "mission_budget_full",
    value: "₹10,373 Cr",
    label: "IndiaAI Mission budget",
    detail: "Cabinet-approved envelope",
    href: "/data/ai-in-india-market-statistics-2026",
  },
  {
    key: "buyers",
    value: "GCC + IT",
    label: "Primary AI buyers",
    detail: "Services exports + captive centers",
    href: "/playbooks",
  },
  {
    key: "indic",
    value: "Indic LLMs",
    label: "Language priority",
    detail: "Policy + hyperscaler focus",
    href: "/compares/sarvam-ai-vs-krutrim",
  },
  {
    key: "stats_hub",
    value: "50+",
    label: "Sourced data points",
    detail: "See the full stats hub",
    href: "/data/ai-in-india-market-statistics-2026",
  },
];
