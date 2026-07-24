import Link from "next/link";
import { PolicyTracker } from "@/components/trackers/policy-tracker";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { getAdvancedFiltersAccess } from "@/lib/auth";
import {
  INDIA_AI_POLICIES,
  policyCoverageStats,
  uniquePolicyInstruments,
  uniquePolicySectors,
} from "@/lib/india-policies";
import { breadcrumbSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "Indian AI Policy Tracker — Central, State & Sectoral",
  description:
    "Living timeline of Indian AI policy: MeitY, DPDP, IndiaAI Mission, RBI/SEBI/IRDAI, deepfake rules, and state AI policies from Tamil Nadu to Maharashtra.",
  path: "/policy",
});

export default async function PolicyPage() {
  const { unlocked } = await getAdvancedFiltersAccess();
  const stats = policyCoverageStats(INDIA_AI_POLICIES);
  const breadcrumbs = [
    { name: "Home", item: absoluteUrl("/") },
    { name: "Policy Tracker", item: absoluteUrl("/policy") },
  ];

  return (
    <div>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      <div className="mx-auto w-full max-w-6xl px-4 pt-12">
        <nav
          aria-label="Breadcrumb"
          className="text-xs font-medium uppercase tracking-[0.05em] text-text-secondary"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-accent">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-text-tertiary">Policy Tracker</li>
          </ol>
        </nav>

        <Badge className="mt-6">Database product</Badge>
        <h1 className="mt-3 text-[32px] font-extrabold tracking-[-0.02em] md:text-5xl">
          Policy Tracker
        </h1>
        <p className="mt-3 max-w-3xl text-text-secondary">
          India has no single AI Act yet. Operators must track a stack: DPDP + IT
          Rules, MeitY / IndiaAI guidelines, sectoral circulars (RBI, SEBI, IRDAI,
          ICMR), court orders on deepfakes, and state AI missions. This tracker
          maps that stack in one timeline.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 border border-border bg-surface p-5 sm:grid-cols-4">
          <div>
            <p className="font-mono text-2xl font-bold text-accent tabular-nums">
              {stats.total}
            </p>
            <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-text-tertiary">
              Instruments
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-accent tabular-nums">
              {stats.central}
            </p>
            <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-text-tertiary">
              Central
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-accent tabular-nums">
              {stats.state}
            </p>
            <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-text-tertiary">
              State entries
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-accent tabular-nums">
              {stats.statesCovered}
            </p>
            <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-text-tertiary">
              States covered
            </p>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-text-tertiary">
          Coverage includes MeitY, IndiaAI Mission, DPDP Act/Rules, IT Act & Rules
          (deepfakes/SGI), NITI Responsible AI, RBI FREE-AI, SEBI/IRDAI/ICMR/CDSCO
          sectoral notes, ECI election advisories, High Court deepfake waves, and
          state policies from Tamil Nadu, Telangana, Karnataka, Maharashtra,
          Odisha, Gujarat, and Andhra Pradesh. Filter by level and instrument type;
          sector filters unlock on Brief+.
        </p>
      </div>

      <div className="mx-auto mt-10 w-full max-w-6xl px-4 pb-12">
        <PolicyTracker
          updates={INDIA_AI_POLICIES}
          sectors={uniquePolicySectors()}
          instruments={uniquePolicyInstruments()}
          advancedUnlocked={unlocked}
        />

        <aside className="mt-12 border border-border bg-muted/30 p-5 text-sm text-text-secondary">
          <p className="font-semibold text-foreground">How to use this tracker</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Start with <strong>legislation / rules</strong> (DPDP, IT Rules) —
              these create enforceable duties.
            </li>
            <li>
              Layer <strong>sectoral</strong> instruments if you sell BFSI, health,
              or securities AI.
            </li>
            <li>
              Check your <strong>state</strong> for incentives, procurement
              templates, and public-sector AI ethics scorecards.
            </li>
            <li>
              Read paired explainers:{" "}
              <Link
                href="/explains/ai-regulation-india-business-guide"
                className="text-accent hover:text-accent-hover"
              >
                AI regulation business guide
              </Link>
              ,{" "}
              <Link
                href="/explains/dpdp-act-ai-training-data"
                className="text-accent hover:text-accent-hover"
              >
                DPDP & training data
              </Link>
              ,{" "}
              <Link
                href="/news/meity-ai-governance-framework-2026"
                className="text-accent hover:text-accent-hover"
              >
                MeitY governance brief
              </Link>
              .
            </li>
          </ul>
          <p className="mt-4 text-xs text-text-tertiary">
            Desk corpus — not legal advice. Always re-verify the primary PDF/Gazette
            before compliance decisions. Spot a missing instrument? Email{" "}
            <a
              href="mailto:editor@indiaaibrief.com"
              className="text-accent hover:text-accent-hover"
            >
              editor@indiaaibrief.com
            </a>
            .
          </p>
        </aside>
      </div>
    </div>
  );
}
