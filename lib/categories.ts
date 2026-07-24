import type { ContentCategory } from "@/types";

export interface CategoryCopy {
  title: string;
  description: string;
  seoText: string;
  path: string;
  revalidate: number;
}

export const CATEGORY_COPY: Record<ContentCategory, CategoryCopy> = {
  news: {
    title: "Indian AI News",
    description:
      "Breaking Indian AI policy, funding, and product news — original angles only.",
    seoText:
      "IndiaAIBrief news covers the Indian AI decisions that change what founders, CTOs, and policymakers do next week — not recycled global wire copy. We track MeitY and state AI missions, DPDP enforcement signals, funding rounds with India-relevant terms, product launches with local pricing or Indic language support, and court or regulator moves that create real compliance work. Every brief opens with a 40–60 word direct answer, then India-specific context, scannable bullets, and audience takeaways so you can brief a board or ship a change without reading three aggregator roundups. Prefer depth over volume: if a story lacks an exclusive angle, original data, or a clear India implication, we skip it. Use this hub to scan today’s developments, then jump into related explainers, comparisons, and playbooks when you need the how-to. For funding tables and multi-quarter trends, also see our Original Data section; for governance frameworks, start with Explainers.",
    path: "/news",
    revalidate: 60,
  },
  explains: {
    title: "AI Explainers",
    description:
      "Answer-first explainers optimized for AI citation and Indian decision-makers.",
    seoText:
      "Explainers on IndiaAIBrief are built for generative engine optimization (GEO) and for humans who need a precise answer first. Topics span India’s DPDP Act and AI training data, MeitY governance guidance, model and agent liability, enterprise agent patterns, open-source versus regulated stacks, and how global regimes (EU, US, China) diverge from India’s path. Each piece leads with a citation-ready answer block, then why it matters for Indian MSMEs, enterprise CTOs, and policymakers, followed by details, audience implications, and FAQ schema. We write for people evaluating vendors, drafting internal policy, or answering board questions — not for keyword stuffing. Cross-link from news when a policy story needs the permanent explainer, and from playbooks when you need the checklist version. If you are comparing vendors, use Compares; if you need implementation steps with INR cost bands, use Playbooks.",
    path: "/explains",
    revalidate: 86400,
  },
  compares: {
    title: "AI Comparisons",
    description:
      "Head-to-head comparisons of AI tools with India presence, pricing, and compliance.",
    seoText:
      "Comparisons on IndiaAIBrief pit tools and model partners that actually serve Indian buyers: India pricing or INR billing, Hindi and Indic language support, DPDP and sector compliance posture, local support, and deployment options that work on Indian latency and data-residency constraints. We name a clear winner by use case instead of dumping feature matrices without a decision. Typical matchups include Indian LLMs versus global APIs for enterprise Hindi workloads, contact-center AI stacks, and cloud versus on-prem agent platforms. Affiliate links, when used, are disclosed; we only recommend products with India presence or support. Read a comparison when procurement needs a shortlist, then open the matching playbook for rollout steps or an explainer when regulation is the gating factor. Fresh news on funding or pivots may change a recommendation — check the date on each piece and related news briefs.",
    path: "/compares",
    revalidate: 86400,
  },
  playbooks: {
    title: "AI Playbooks",
    description:
      "Implementation playbooks that convert insight into action for Indian MSMEs and teams.",
    seoText:
      "Playbooks turn Indian AI intelligence into checklists you can run this week. They cover deploying chatbots and agents for e-commerce and BFSI, RBI-aligned model risk controls, IndiaAI “Do No Harm” style startup steps, and readiness scorecards that map to our paid kit and audit offers. Expect numbered steps, INR cost bands where useful, compliance hooks (DPDP, sector circulars), and failure modes we have seen in Indian production — not generic Silicon Valley templates. Use playbooks after an explainer has clarified the “why” or a comparison has chosen a vendor. Product CTAs point to the AI Compliance Starter Kit and AI Readiness Audit when you want templates and a scored review. Subscribe to The Brief if you want weekly updates when playbooks are revised after new MeitY or RBI guidance.",
    path: "/playbooks",
    revalidate: 86400,
  },
  data: {
    title: "Original Data",
    description:
      "Original datasets and funding/policy analyses that build topical authority.",
    seoText:
      "Original Data is where IndiaAIBrief publishes tables, funding tallies, and adoption metrics you will not get from aggregator roundups. Examples include quarterly Indian AI funding rollups, tier-2 and tier-3 city AI economy maps, and market statistics desks synthesize from primary filings, company statements, and policy documents. Every dataset piece states methods, caveats, and what the numbers mean for founders, investors, and policymakers in India. We update evergreen data pages in place when new quarters close; news covers the breaking announcement. Use these pages when you need citeable figures for decks, grant applications, or journalism — then follow internal links to related explainers and news for narrative context. If a number is contested, we note sources and confidence rather than rounding away uncertainty.",
    path: "/data",
    revalidate: 86400,
  },
};
