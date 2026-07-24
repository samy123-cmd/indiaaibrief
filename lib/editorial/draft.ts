import "server-only";

import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import type { Signal } from "@/drizzle/schema";

function buildDraftPrompt(signal: Signal): string {
  return `You are a senior tech journalist at IndiaAIBrief. Write an article about "${signal.title}" following our answer-first structure.

CONTEXT:
- Source: ${signal.source}
- Source URL: ${signal.sourceUrl}
- Category: ${signal.category}
- Impact: ${signal.impactLevel}
- India relevance: ${signal.indiaRelevance}
- Summary: ${signal.summary}
- Related startups: ${signal.relatedStartups.join(", ") || "none"}
- Related policies: ${signal.relatedPolicies.join(", ") || "none"}
- Raw excerpt:
${signal.rawContent.slice(0, 4000)}

REQUIREMENTS:
1. Lead with a 40-60 word direct answer wrapped in <Answer>...</Answer>
2. Include H2 sections exactly titled:
   - What Changed
   - The Details
   - What This Means for Indian Founders and CTOs
   - Frequently Asked Questions
3. Tone: direct, no fluff, India-first
4. Every article MUST answer "Why does this matter to India specifically?"
5. Include at least 3 irreplaceable elements competitors lack:
   - Original analysis of Indian market impact
   - Comparison with Indian alternatives or competitors
   - Expert/stakeholder angle relevant to India (can be attributed as analysis if no named quote)
   - India-specific data point (market size, user base, funding context, or regulatory context)
   - Historical Indian context vs past moves
6. Attribute claims to the primary source URL: ${signal.sourceUrl}
7. Add 3-5 FAQs with concise answers
8. Output valid MDX body only (no frontmatter). Use markdown headings and lists.
9. Do not invent funding amounts or official quotes. If unknown, say so clearly.`;
}

function fallbackDraft(signal: Signal): string {
  return `<Answer>
${signal.summary || signal.title} This development matters for Indian founders, CTOs, and policymakers tracking AI adoption, compliance, and competitive positioning in India.
</Answer>

${signal.summary}

## What Changed

- ${signal.title}
- Source: [${signal.source}](${signal.sourceUrl})
- Category: ${signal.category}; impact: ${signal.impactLevel}

## The Details

${signal.rawContent.slice(0, 1500) || signal.summary}

Primary source: [${signal.sourceUrl}](${signal.sourceUrl})

## What This Means for Indian Founders and CTOs

- Assess India-specific market impact and competitive alternatives.
- Map compliance implications under Indian policy frameworks where relevant.
- Compare against Indian AI vendors and enterprise buyers' constraints (cost, language, data residency).

## Frequently Asked Questions

### Why does this matter to India?

Because Indian buyers, builders, and regulators operate under distinct policy, language, and cost constraints that change how this signal plays out locally.

### What should founders do next?

Track primary source updates, compare Indian alternatives, and document compliance implications before adopting or responding.

### Is this a direct India event?

India relevance classified as **${signal.indiaRelevance}**.
`;
}

export async function generateArticleDraft(signal: Signal): Promise<string> {
  const hasGateway =
    Boolean(process.env.AI_GATEWAY_API_KEY) ||
    Boolean(process.env.VERCEL_OIDC_TOKEN);

  if (!hasGateway) {
    return fallbackDraft(signal);
  }

  try {
    const { text } = await generateText({
      model: gateway("openai/gpt-4.1-mini"),
      prompt: buildDraftPrompt(signal),
      temperature: 0.4,
      maxOutputTokens: 3500,
    });

    const draft = text.trim();
    if (!draft.includes("<Answer") || !draft.includes("What This Means")) {
      return `${draft}\n\n${fallbackDraft(signal)}`;
    }
    return draft;
  } catch (error) {
    console.error("[editorial/draft] AI generation failed:", error);
    return fallbackDraft(signal);
  }
}
