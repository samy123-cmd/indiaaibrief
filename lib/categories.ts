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
      "Track MeitY circulars, state AI missions, funding rounds, and product launches that actually change decisions for Indian founders and CTOs. Every brief leads with a direct answer, India-specific context, and actionable takeaways — not wire-copy aggregation.",
    path: "/news",
    revalidate: 60,
  },
  explains: {
    title: "AI Explainers",
    description:
      "Answer-first explainers optimized for AI citation and Indian decision-makers.",
    seoText:
      "Long-form explainers built for GEO and Google: DPDP, AI governance, model choices, and compliance — structured so ChatGPT, Perplexity, and Search Overviews can cite a precise answer. Written for MSMEs, enterprise CTOs, and policymakers in India.",
    path: "/explains",
    revalidate: 86400,
  },
  compares: {
    title: "AI Comparisons",
    description:
      "Head-to-head comparisons of AI tools with India presence, pricing, and compliance.",
    seoText:
      "Vendor comparisons with India pricing, Hindi/Indic support, DPDP fit, and clear winners by use case. Built for procurement teams and founders who need a decision — not a feature dump.",
    path: "/compares",
    revalidate: 86400,
  },
  playbooks: {
    title: "AI Playbooks",
    description:
      "Implementation playbooks that convert insight into action for Indian MSMEs and teams.",
    seoText:
      "Step-by-step playbooks for deploying AI in Indian e-commerce, BFSI, healthcare, and government workflows — with checklists, cost bands in INR, and compliance hooks you can run this week.",
    path: "/playbooks",
    revalidate: 86400,
  },
  data: {
    title: "Original Data",
    description:
      "Original datasets and funding/policy analyses that build topical authority.",
    seoText:
      "Original tables and analyses on Indian AI funding, policy timelines, and adoption metrics. Numbers you will not find in aggregator roundups — designed for investors, founders, and journalists.",
    path: "/data",
    revalidate: 86400,
  },
};
