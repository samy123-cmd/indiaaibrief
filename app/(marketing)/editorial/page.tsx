import Link from "next/link";
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
        clearly and limited to AI companies with Indian operations. Ranking tables
        and “winners” in comparisons reflect disclosed criteria — India pricing,
        Indic language support, compliance posture — not advertiser spend.
      </p>

      <h2>No pay-for-play</h2>
      <p>
        Payment does not buy a positive review, ranking, or news placement. Startup
        Tracker and Policy Tracker listings are editorial and data products, not
        paid directories. If a commercial relationship exists with a subject we
        cover, we disclose it on the article or author page.
      </p>

      <h2>Correction process</h2>
      <p>
        Material errors are corrected in-place within <strong>48 hours</strong> of
        confirmation, with a visible note and updated modification date. Report
        issues to{" "}
        <a href="mailto:hello@indiaaibrief.com">hello@indiaaibrief.com</a> with the
        URL and supporting evidence. Non-material typos may be fixed silently;
        factual changes always leave a paper trail for readers.
      </p>

      <h2>Source verification</h2>
      <p>
        We cite <strong>primary sources</strong> for hard claims: government
        documents, company filings, statute text, and on-record quotes. Aggregator
        rewrites without added value are prohibited. Where numbers conflict across
        reports, we state the range and which source we trust for decision-making.
      </p>

      <h2>Conflict of interest</h2>
      <p>
        Writers disclose financial interests in companies they cover. Equity,
        advisory roles, or recent employment related to a subject are noted on the
        article or author page. Desk bylines are used when multiple editors share
        responsibility for a brief.
      </p>

      <h2>AI disclosure</h2>
      <p>
        We use AI tools for outlines and first drafts. Humans fact-check every
        claim, enrich with India-specific insight, and approve publication. The
        byline is human-owned. We do not publish unverified model output as news.
      </p>

      <h2>Audience promise</h2>
      <p>
        Content answers what is unique, exclusive, or genuinely helpful for India
        that competitors are not saying. Read{" "}
        <Link href="/about">About</Link>,{" "}
        <Link href="/authors">Authors</Link>, and{" "}
        <Link href="/dmca">DMCA</Link> for related policies.
      </p>
    </article>
  );
}
