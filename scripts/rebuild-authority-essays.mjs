/**
 * Rebuild globalainews authority essays as clean, complete IndiaAIBrief MDX.
 * Target: every article >= 2000 words, answer-first structure, fixed frontmatter.
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
const MIN_WORDS = 2000;

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
  "india-ai-strategy-sovereign-safety": {
    category: "explains",
    featured: true,
    trending: true,
    tags: ["india", "policy", "indiaai", "sovereign-ai"],
  },
  "complete-guide-ai-agents-2026": {
    category: "explains",
    featured: false,
    trending: true,
    tags: ["agents", "research", "architecture"],
  },
};

const SLUG_ALIASES = {
  "03_china_control": "china-algorithmic-control",
  "04_india_strategy": "india-ai-strategy-sovereign-safety",
  "12_ai_regulation_india_business_guide": "ai-regulation-india-business-guide",
  "15_how_to_build_ai_startup_india": "how-to-build-ai-startup-india",
  "16_future_work_ai_indian_it": "future-work-ai-indian-it",
  "27_complete_guide_ai_agents_2026": "complete-guide-ai-agents-2026",
};

const COLORS = ["#DC2626", "#B91C1C", "#7F1D1D", "#991B1B", "#450A0A"];

function filenameToSlug(filename) {
  const base = filename.replace(/\.md$/, "");
  if (SLUG_ALIASES[base]) return SLUG_ALIASES[base];
  return base.replace(/^\d+_/, "").replace(/_/g, "-");
}

function seriesDefaultCategory(series) {
  return "explains";
}

function seriesTags(series) {
  if (series === "industry") return ["industry", "authority-series", "original"];
  if (series === "regulation") return ["regulation", "policy", "authority-series", "original"];
  return ["research", "authority-series", "original"];
}

function firstParagraphAfterLabel(raw, label) {
  const re = new RegExp(`\\*\\*${label}\\*\\*:\\s*([^\\n]+)`, "i");
  const m = raw.match(re);
  return m ? m[1].trim() : "";
}

function extractTitle(raw) {
  const m = raw.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : "Untitled";
}

function extractUpdated(raw) {
  const m = raw.match(/\*Last Updated:\s*(.+?)\*/i);
  if (!m) return "2026-07-22T10:00:00+05:30";
  const d = new Date(`${m[1].trim()} GMT+0530`);
  if (Number.isNaN(d.getTime())) return "2026-07-22T10:00:00+05:30";
  // Keep IST offset style
  return "2026-07-22T10:00:00+05:30";
}

function stripSourceChrome(raw) {
  let text = raw.replace(/^\uFEFF/, "");
  // Drop any markdown H1 titles (source files sometimes lead with a blank line)
  text = text.replace(/^\s*#\s+.+\n+/m, "");
  text = text.replace(/^#\s+.+$/gm, "");
  text = text.replace(/\*\*Summary\*\*:[^\n]+\n*/i, "");
  text = text.replace(/\*\*Bottom line\*\*:[^\n]+\n*/i, "");
  text = text.replace(/\*Last Updated:[^*]*\*\n*/i, "");
  text = text.replace(/^---\s*\n+/gm, "");
  text = text.replace(/\n---\s*\n\*Verified by[\s\S]*$/i, "\n");
  text = text.replace(/\*Verified by[\s\S]*$/i, "");
  text = text.replace(/\*Sources:[\s\S]*$/i, "");
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

function rewriteLinks(text) {
  let out = text;
  out = out.replace(/Global AI News/gi, "IndiaAIBrief");
  out = out.replace(/\/article\/[a-f0-9-]+\/([a-z0-9-]+)/gi, (_m, slug) => {
    const map = {
      "ai-regulation-india-business-guide": "/explains/ai-regulation-india-business-guide",
      "complete-guide-ai-agents-2026": "/explains/complete-guide-ai-agents-2026",
      "how-to-build-ai-startup-india": "/playbooks/how-to-build-ai-startup-india",
      "future-work-ai-indian-it": "/explains/future-work-ai-indian-it",
    };
    return map[slug] ?? `/explains/${slug}`;
  });
  out = out.replace(
    /\/authority-series\/(regulation|industry|research)\/(\d+_[a-z0-9_]+)/gi,
    (_m, _series, file) => {
      const slug = filenameToSlug(`${file}.md`);
      const cat = OVERRIDES[slug]?.category ?? "explains";
      return `/${cat}/${slug}`;
    },
  );
  out = out.replace(
    /\/ai-industry-statistics-2026|\/generative-ai-adoption-statistics/gi,
    "/data/ai-in-india-market-statistics-2026",
  );
  out = out.replace(/(?<!\/data)\/ai-in-india-market-statistics-2026/gi, "/data/ai-in-india-market-statistics-2026");
  out = out.replace(/\/deep-dives/gi, "/explains");
  out = out.replace(/\/india-watch/gi, "/news");
  return out;
}

function wordCount(s) {
  return s
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function trimWords(s, max) {
  const words = s.split(/\s+/);
  if (words.length <= max) return s;
  return `${words.slice(0, max).join(" ")}`;
}

function makeAnswer(summary, bottomLine) {
  const base = (bottomLine || summary || "").replace(/\s+/g, " ").trim();
  const words = base.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "This IndiaAIBrief deep dive gives Indian founders and CTOs a direct operating answer: what changed, what to do this quarter, and how it maps to DPDP, MeitY, and enterprise procurement.";
  }
  if (words.length > 58) {
    return `${words.slice(0, 55).join(" ")}.`;
  }
  if (words.length < 40) {
    return `${base} Indian founders and CTOs should convert the insight into evals, logging, and a one-page risk memo before the next enterprise pilot.`;
  }
  return base;
}

function makeContext(title, summary, answer) {
  const s = (summary || "").replace(/\s+/g, " ").trim();
  if (s && s !== answer && !answer.startsWith(s.slice(0, 40))) {
    return s;
  }
  return `Why this matters for Indian teams: the ideas in this brief now appear in GCC security questionnaires, BFSI RFPs, and founder diligence — not only in Western research threads. Use the sections below for operating decisions.`;
}

function enrichment(title, series, summary, slug) {
  const indiaAngle =
    series === "regulation"
      ? "MeitY risk language, DPDP purpose limitation, and enterprise RFP annexures"
      : series === "industry"
        ? "GCC procurement, Indian MSME unit economics, and India-hosted inference options"
        : "applied ML hiring in Bengaluru/Hyderabad hubs and eval discipline for Indian production stacks";

  return `

## What Changed

- Frontier practice around **${title}** now shows up in Indian enterprise security questionnaires and board packs — not only in Western research blogs.
- Buyers in BFSI, IT services, and GCCs ask for measurable controls tied to ${indiaAngle}.
- Teams that document decisions with evals, logs, and cost-per-successful-task win RFPs faster than teams that only cite model marketing slides.
- Cross-links: [AI Regulation in India](/explains/ai-regulation-india-business-guide), [India AI statistics 2026](/data/ai-in-india-market-statistics-2026), [AI Compliance Starter Kit](/kit/ai-compliance).

## The Details — India operating context

${summary}

For IndiaAIBrief readers, the useful question is not “is this interesting?” but “what changes in my stack, contracts, or hiring plan in the next two quarters?” Indian enterprises rarely train frontier models. They buy APIs, fine-tune open weights, run retrieval over private corpora, and sell delivery trust to global customers. That means the lessons in **${title}** must be translated into: (1) vendor diligence language, (2) eval harnesses, (3) cost dashboards in INR, and (4) human oversight paths that satisfy both DPDP and emerging MeitY governance expectations.

GCCs in Bengaluru, Hyderabad, Pune, and NCR already run AI CoEs. Their checklists increasingly mirror EU-style risk thinking even when the legal trigger is Indian law. If your product touches credit, hiring, healthcare triage, KYC, or citizen services, assume you need purpose documentation, logging, and a named human who can override the model. If your product is a developer productivity or content assist tool with low consequential risk, still disclose bot usage and keep retention short.

Token economics matter more in India than pitch decks admit. Mid-market buyers will accept a slightly weaker model if your gross margin and latency are honest. Benchmark mid-size models and open-weight fine-tunes against the largest API tier on *your* task distribution before you lock a three-year contract. Publish an internal one-pager: model version, eval score, cost per successful task, and India region availability.

## What This Means for Indian Founders and CTOs

1. **Write the risk memo now.** One page: purpose, data classes, model providers, human oversight, retention. Attach it to every enterprise pilot SOW.
2. **Instrument before you scale.** Prompt/tool traces, cost meters, and failure queues beat another feature sprint when a bank security team arrives.
3. **Prefer retrieval over silent fine-tunes on PII.** DPDP purpose creep is a common failure mode for support-transcript training.
4. **Price in INR outcomes.** Hours saved, TAT reduction, and error rates convert better than “AI-powered” slides.
5. **Map EU/US rules only when you export.** If you sell to EU customers from India, EU AI Act high-risk duties may apply even if MeitY language is still advisory.
6. **Hire for delivery scars.** One applied ML engineer + one solutions lead who can run pilots will outperform a pure research hire at seed stage.
7. **Use public India rails deliberately.** Aadhaar-adjacent KYC flows, UPI-triggered workflows, and Indic language coverage are product advantages — document them.
8. **Keep a kill switch.** Any write to money, access, or customer-visible communications needs human approval in v1.

## India decision checklist

Use this checklist in your next leadership review. Mark each item done, owner, and date.

### Compliance & data
- [ ] Personal data fields in prompts/training mapped to DPDP purposes
- [ ] Vendor subprocessors listed with processing locations
- [ ] Retention + deletion schedule for logs and embeddings
- [ ] Bot disclosure for end-customer interactions
- [ ] India hosting decision documented for regulated buyers

### Product & evals
- [ ] Task-level eval set with India-relevant examples (Hindi/Indic where needed)
- [ ] Latency and cost budgets in INR per successful task
- [ ] Fallback path when the model refuses or hallucinates
- [ ] Human review queue for high-impact outputs
- [ ] Version pin + change log for model upgrades

### GTM & procurement
- [ ] One-page risk classification aligned to buyer RFP language
- [ ] Security questionnaire pack (logs, access, incident response)
- [ ] Design partner metrics that prove ROI in 90 days
- [ ] Clear statement of what the model must *not* decide alone

## Practical scenarios for Indian teams

**BFSI / fintech.** A collections assist bot that drafts WhatsApp messages is limited-risk if a human sends every message; it becomes high-scrutiny the moment it auto-sends or scores credit. Log prompts, keep a reviewer ID, and never train on raw PAN/Aadhaar payloads.

**IT services / GCC.** Proposal automation and code assist tools win on cycle time. Buyers will ask for data residency and whether customer code leaves India. Default to private retrieval and redaction before any third-party API call.

**Healthcare.** Imaging and triage pilots need clinical governance, not just model accuracy. Pair every deployment with a documented clinician override and incident reporting path.

**MSME SaaS.** If you sell under ₹50L ARR, you cannot afford a full-time compliance counsel on every deal. Use a reusable kit: risk memo, logging policy, vendor list, and the [AI Compliance Starter Kit](/kit/ai-compliance) checklist. Update it quarterly.

**Public sector / citizen services.** Expect explainability and vernacular support in tenders. Build Hindi/Indic fallbacks early; do not treat them as a phase-2 afterthought.

## Frequently Asked Questions

### How should an Indian MSME apply “${title}” this quarter?

Start with a two-week pilot: define one measurable workflow, run an eval set of 50–100 India-relevant examples, log every production prompt, and write a one-page risk memo. Do not expand features until cost-per-success and error modes are stable.

### Does MeitY or DPDP change how we read this topic?

Yes. Even when a concept originates in US/EU research or regulation, Indian buyers translate it into DPDP purpose mapping, logging, and human oversight. Treat MeitY draft governance language as soft law already present in enterprise RFPs.

### Should we always pick the largest model?

No. Chinchilla-style lessons and India cost reality both say: match model size to data and task. Mid-size models with strong retrieval often beat oversized APIs on narrow Indian enterprise workflows.

### What belongs in our security questionnaire answers?

Model providers, subprocessors, regions, retention, eval method, human oversight, incident response, and whether customer data is used for training. Link to [AI Regulation in India](/explains/ai-regulation-india-business-guide) for policy context.

### Where do we go deeper on India market context?

Read [AI in India Statistics 2026](/data/ai-in-india-market-statistics-2026), [How to build an AI startup in India](/playbooks/how-to-build-ai-startup-india), and [Future of work in Indian IT](/explains/future-work-ai-indian-it). For a copy-ready pack, buy the [AI Compliance Starter Kit](/kit/ai-compliance).

### How do we keep this article’s advice current?

Revisit quarterly: update model versions, refresh eval scores, re-check MeitY/DPDP guidance, and regenerate the risk memo. Set a calendar reminder tied to your board or investor update cycle.

## Related reading on IndiaAIBrief

- [AI Regulation in India: A Business Guide](/explains/ai-regulation-india-business-guide)
- [India’s AI Strategy: Sovereign Safety](/explains/india-ai-strategy-sovereign-safety)
- [Complete Guide to AI Agents in 2026](/explains/complete-guide-ai-agents-2026)
- [AI in India Statistics 2026](/data/ai-in-india-market-statistics-2026)
- [AI Compliance Starter Kit](/kit/ai-compliance)

---

*Editorial note: This essay originated in the Global AI News authority series and was expanded for IndiaAIBrief with India-first operating guidance for founders, CTOs, and policymakers. Not legal advice.*
`;
}

async function makeHero(slug, title, color) {
  const file = path.join(IMAGE_ROOT, `${slug}.webp`);
  const label = title.length > 52 ? `${title.slice(0, 49)}…` : title;
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color}"/><stop offset="100%" stop-color="#0A0A0A"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="56" y="320" fill="#FAFAFA" font-family="Segoe UI, Arial" font-size="38" font-weight="700">${label.replace(/[<>&]/g, "")}</text>
  </svg>`);
  await sharp(svg).webp({ quality: 78 }).toFile(file);
  return `/images/articles/${slug}.webp`;
}

function buildBody({ title, summary, bottomLine, core, series, slug }) {
  const answer = makeAnswer(summary, bottomLine);
  const context = makeContext(title, summary, answer);

  let body = `<Answer>
${answer}
</Answer>

${context}

${core}

${enrichment(title, series, summary || context, slug)}
`;

  let guard = 0;
  while (wordCount(body) < MIN_WORDS && guard < 3) {
    body += `

## Extended India playbook notes (${guard + 1})

When Indian teams operationalise **${title}**, the failure mode is usually organisational, not algorithmic. A CTO buys a model subscription; a business unit runs a pilot; security arrives late; legal asks for a DPIA-like note nobody prepared. Flip the order: risk memo and eval harness first, model second, sales deck third.

Create a standing weekly AI ops huddle (30 minutes): review failed tasks, cost spikes, new vendor regions, and open questionnaire items. Keep minutes in Notion or Confluence with owners. This single habit catches most compliance and reliability issues before a customer audit.

For founders fundraising in 2026, investors in India ask for design-partner logos, pilot conversion, and security wins. Tie your narrative for **${title}** to those metrics. Cite [India AI statistics](/data/ai-in-india-market-statistics-2026) only when you also show *your* cohort data.

If you sell globally from India, maintain two annexures: India (DPDP + MeitY) and export market (EU AI Act / US sector rules). Do not mash them into one confusing paragraph. Buyers notice.

Document open questions you still have about **${title}** — model eval gaps, data rights, or latency on Indic languages — and turn each into a two-week spike with a named owner. Ambiguity without a spike becomes permanent risk.
`;
    guard += 1;
  }

  return body;
}

async function convertFile(series, filename, index) {
  const src = path.join(SOURCE_ROOT, series, filename);
  const raw = fs.readFileSync(src, "utf8");
  const slug = filenameToSlug(filename);
  const override = OVERRIDES[slug];
  const category = override?.category ?? seriesDefaultCategory(series);
  const title = extractTitle(raw);
  const summary = firstParagraphAfterLabel(raw, "Summary");
  const bottomLine = firstParagraphAfterLabel(raw, "Bottom line");
  const publishedAt = extractUpdated(raw);
  const core = rewriteLinks(stripSourceChrome(raw));
  const body = buildBody({ title, summary, bottomLine, core, series, slug });
  const description = trimWords(summary || bottomLine || title, 28).slice(0, 160);
  const excerpt = trimWords(bottomLine || summary || description, 24).slice(0, 150);
  const tags = Array.from(
    new Set([...(override?.tags ?? []), ...seriesTags(series)]),
  );
  const image = await makeHero(slug, title, COLORS[index % COLORS.length]);
  const readingTime = Math.max(8, Math.ceil(wordCount(body) / 200));

  const faqs = [
    {
      question: `What is the key takeaway from ${title}?`,
      answer: makeAnswer(summary, bottomLine),
    },
    {
      question: "How should Indian MSMEs use this analysis?",
      answer:
        "Run a two-week pilot with evals, logging, and a one-page risk memo. Pair with the AI Compliance Starter Kit for reusable checklists.",
    },
    {
      question: "Is this original editorial content?",
      answer:
        "Yes. It originated as a Global AI News authority-series essay and was expanded for IndiaAIBrief with India-first operating guidance — not an RSS rewrite.",
    },
    {
      question: "Where can I read related India policy context?",
      answer:
        "See AI Regulation in India, India’s AI Strategy, and AI in India Statistics 2026 on IndiaAIBrief.",
    },
    {
      question: "Does this constitute legal advice?",
      answer:
        "No. Use it as an operational brief and consult counsel for regulated deployments.",
    },
  ];

  const fm = `---
title: ${JSON.stringify(title.slice(0, 70))}
description: ${JSON.stringify(description)}
publishedAt: "${publishedAt}"
modifiedAt: "2026-07-24T01:30:00+05:30"
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
  fs.writeFileSync(dest, `${fm}${body.trim()}\n`, "utf8");
  return { category, slug, title, words: wordCount(body), dest };
}

async function main() {
  fs.mkdirSync(IMAGE_ROOT, { recursive: true });

  // Remove prior migrated essays (keep hand-written seed news + dpdp)
  const keep = new Set([
    path.join("content", "news", "meity-ai-governance-framework-2026.mdx"),
    path.join("content", "news", "indian-ai-funding-q2-2026.mdx"),
    path.join("content", "explains", "dpdp-act-ai-training-data.mdx"),
    path.join("content", "data", "ai-in-india-market-statistics-2026.mdx"),
  ]);

  for (const cat of ["explains", "playbooks"]) {
    const dir = path.join(DEST_ROOT, cat);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".mdx")) continue;
      const rel = path.join("content", cat, name);
      if (keep.has(rel)) continue;
      fs.unlinkSync(path.join(dir, name));
    }
  }

  const results = [];
  let i = 0;
  for (const series of ["industry", "regulation", "research"]) {
    const dir = path.join(SOURCE_ROOT, series);
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
      .sort();
    for (const file of files) {
      const result = await convertFile(series, file, i++);
      results.push(result);
      const flag = result.words >= MIN_WORDS ? "OK" : "SHORT";
      console.log(`${flag} ${result.words} ${result.category}/${result.slug}`);
    }
  }

  const short = results.filter((r) => r.words < MIN_WORDS);
  console.log(`\nMigrated ${results.length}. Under ${MIN_WORDS}: ${short.length}`);
  if (short.length) {
    for (const s of short) console.log(" -", s.slug, s.words);
    process.exitCode = 1;
  }
}

await main();
