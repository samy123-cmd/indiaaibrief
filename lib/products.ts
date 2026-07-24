import type { FaqItem, ProductKit } from "@/types";

export interface ProductDeliverable {
  id: string;
  title: string;
  description: string;
  format: "PDF" | "Markdown" | "Checklist" | "Workspace";
  href?: string;
  downloadPath?: string;
}

export interface ProductOutcome {
  title: string;
  description: string;
}

export interface DigitalProduct extends ProductKit {
  headline: string;
  problem: string;
  agitation: string;
  solution: string;
  deliverables: ProductDeliverable[];
  outcomes: ProductOutcome[];
  faqs: FaqItem[];
  image: string;
}

const KIT_AMOUNT_PAISE = Number(
  process.env.RAZORPAY_KIT_AMOUNT_PAISE ?? 99900,
);
const AUDIT_AMOUNT_PAISE = Number(
  process.env.RAZORPAY_AUDIT_AMOUNT_PAISE ?? 499900,
);

export const COMPLIANCE_KIT: DigitalProduct = {
  slug: "ai-compliance",
  name: "AI Compliance Starter Kit for Indian MSMEs",
  headline: "Ship AI in India without guessing compliance",
  description:
    "India-first playbook, 47-point checklist, and workspace template covering DPDP-aware data practices, vendor diligence, and RFP-ready artefacts — ₹999 one-time.",
  priceInr: 999,
  pricePaise: KIT_AMOUNT_PAISE,
  currency: "INR",
  image: "/images/products/ai-compliance-kit.webp",
  features: [
    "DPDP-aligned AI data checklist (47 controls)",
    "Vendor risk + escalation workspace template",
    "India-first playbook (Markdown + PDF cover)",
    "Instant download page after Razorpay payment",
  ],
  problem:
    "Indian MSMEs are deploying chatbots, lead scorers, and OCR pipelines without a clear answer to: Is this DPDP-ready? Will MeitY’s AI governance draft block our next enterprise deal?",
  agitation:
    "Enterprise RFPs already ask for risk memos, logging policies, and data maps. Founders scramble through 40-page PDFs, hire consultants at ₹1L+, or lose the deal because the compliance deck is a slide of buzzwords.",
  solution:
    "The AI Compliance Starter Kit gives you a copy-ready pack — playbook, 47-point checklist, and workspace boards — tuned for Indian MSMEs selling AI under ₹50L ARR. Buy once for ₹999. Download in minutes.",
  deliverables: [
    {
      id: "playbook-md",
      title: "AI Compliance Playbook",
      description:
        "India-first operating guide: DPDP purpose mapping, risk tiers, oversight patterns, vendor diligence, and a 30-day sequence.",
      format: "Markdown",
      downloadPath: "/downloads/ai-compliance/ai-compliance-playbook.md",
    },
    {
      id: "pdf",
      title: "Executive PDF cover",
      description:
        "Printable cover + contents for sharing with stakeholders. Full detail lives in the Markdown playbook.",
      format: "PDF",
      downloadPath: "/downloads/ai-compliance/ai-compliance-playbook.pdf",
    },
    {
      id: "checklist",
      title: "47-point compliance checklist",
      description:
        "Walkable controls across data, governance, vendors, and RFP pack — before any BFSI, health, or government pilot.",
      format: "Checklist",
      downloadPath: "/downloads/ai-compliance/ai-compliance-checklist.md",
    },
    {
      id: "workspace",
      title: "Workspace template",
      description:
        "Duplicate-ready boards for data inventory, vendor diligence, and escalation owners — Notion, Linear, or Sheets.",
      format: "Workspace",
      downloadPath: "/downloads/ai-compliance/workspace-template.md",
    },
  ],
  outcomes: [
    {
      title: "RFP artefacts in a week",
      description:
        "Risk memo outline, logging fields, and subprocessor table — the three asks enterprise buyers actually open.",
    },
    {
      title: "DPDP hygiene without a lawyer on retainer",
      description:
        "Purpose map, retention owners, and deletion path for every personal dataset that touches your models.",
    },
    {
      title: "Oversight you can demo",
      description:
        "Human override path and immutable log fields for high-tier workflows — ready for a security questionnaire.",
    },
  ],
  faqs: [
    {
      question: "What exactly do I get after payment?",
      answer:
        "Instant access to the download page with the Markdown playbook, PDF cover, 47-point checklist, and workspace template. A receipt follows from Razorpay.",
    },
    {
      question: "Is this legal advice?",
      answer:
        "No. The kit is practical compliance hygiene for Indian MSMEs — not a substitute for counsel on regulated deals. Use it to prepare; escalate material risk to your lawyer.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes. 7-day refund on digital products if you have not completed substantial download use. Email hello@indiaaibrief.com with your Razorpay payment ID.",
    },
    {
      question: "Which payment methods work?",
      answer:
        "Razorpay checkout supports UPI, cards, and netbanking. Amount is ₹999 one-time — no subscription.",
    },
    {
      question: "Will this cover MeitY-style AI governance asks?",
      answer:
        "Yes. The playbook maps risk tiers, logging, and human oversight expectations that Indian enterprise buyers are already copying into RFPs.",
    },
  ],
};

export const PRODUCTS = {
  complianceKit: {
    slug: COMPLIANCE_KIT.slug,
    name: COMPLIANCE_KIT.name,
    priceInr: COMPLIANCE_KIT.priceInr,
    amountPaise: COMPLIANCE_KIT.pricePaise,
    pricePaise: COMPLIANCE_KIT.pricePaise,
    description: COMPLIANCE_KIT.description,
    currency: COMPLIANCE_KIT.currency,
    features: COMPLIANCE_KIT.features,
  },
  readinessAudit: {
    slug: "ai-readiness",
    name: "AI Readiness Audit — 47-Point Scorecard",
    priceInr: 4999,
    amountPaise: AUDIT_AMOUNT_PAISE,
    pricePaise: AUDIT_AMOUNT_PAISE,
    description:
      "47-point scorecard for Indian MSMEs and product teams with a 3-day turnaround PDF report.",
    currency: "INR" as const,
    features: [
      "47-point readiness scorecard",
      "Written PDF report",
      "3-day turnaround",
      "1 follow-up call",
    ],
  },
} as const;

export function getDigitalProduct(slug: string): DigitalProduct | null {
  if (slug === COMPLIANCE_KIT.slug) return COMPLIANCE_KIT;
  return null;
}
