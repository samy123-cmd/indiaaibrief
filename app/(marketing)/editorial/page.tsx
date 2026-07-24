import { buildMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Editorial Policy",
  description:
    "IndiaAIBrief editorial standards — independence, corrections, primary sources, conflicts, and AI disclosure.",
  path: "/editorial",
});

const UPDATED = "24 July 2026";

export default function EditorialPage() {
  return (
    <article className="prose-article mx-auto px-4 py-12">
      <h1>Editorial Policy</h1>
      <p>Last updated: {UPDATED}</p>
      <div className="answer-block">
        Every IndiaAIBrief article must include three or more irreplaceable
        elements — original data, India-specific analysis, or contrarian takes —
        and every factual claim is human-verified against primary sources.
      </div>

      <h2>Independent coverage</h2>
      <p>
        We do not sell editorial coverage. Product recommendations and comparisons
        disclose affiliate relationships when present. Sponsored briefs are labeled
        clearly and limited to AI companies with Indian operations.
      </p>

      <h2>No pay-for-play</h2>
      <p>
        Payment does not buy a positive review, ranking, or news placement. Startup
        Tracker and Policy Tracker listings are editorial/data products, not paid
        directories.
      </p>

      <h2>Correction process</h2>
      <p>
        Material errors are corrected in-place within <strong>48 hours</strong> of
        confirmation, with a visible note and updated modification date. Report
        issues to{" "}
        <a href="mailto:hello@indiaaibrief.com">hello@indiaaibrief.com</a> with the
        URL and supporting evidence.
      </p>

      <h2>Source verification</h2>
      <p>
        We cite <strong>primary sources</strong> for hard claims: government
        documents, company filings, statute text, and on-record quotes. Aggregator
        rewrites without added value are prohibited.
      </p>

      <h2>Conflict of interest</h2>
      <p>
        Writers disclose financial interests in companies they cover. Equity,
        advisory roles, or recent employment related to a subject are noted on the
        article or author page.
      </p>

      <h2>AI disclosure</h2>
      <p>
        We use AI tools for outlines and first drafts. Humans fact-check every
        claim, enrich with India-specific insight, and approve publication. The
        byline is human-owned.
      </p>
    </article>
  );
}
