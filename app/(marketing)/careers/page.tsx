import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Careers",
  description:
    "Careers at IndiaAIBrief — we hire periodically for editorial and product roles covering Indian AI.",
  path: "/careers",
});

export default function CareersPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <Badge variant="outline">Careers</Badge>
      <h1 className="mt-3 text-[32px] font-extrabold tracking-[-0.02em] md:text-5xl">
        Work on Indian AI intelligence
      </h1>
      <p className="mt-3 text-base leading-7 text-text-secondary">
        IndiaAIBrief is a small, performance-obsessed team building an AI
        intelligence platform for Indian founders, CTOs, policymakers, and MSME
        operators. We are not hiring full-time roles right now — but we read
        every strong pitch and keep a shortlist for when seats open.
      </p>

      <section className="mt-10 rounded-lg border border-dashed border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">
          No open roles today
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          When we open editorial, research, or product seats, we post them here
          first and mention them in The Brief newsletter. Until then, send a
          short note (five sentences max) and two to three links to your best
          work. Tell us which India-specific AI problem you want to cover or
          ship, and what you would change on the site in your first month.
        </p>
        <Button asChild className="mt-4" size="lg">
          <a href="mailto:hello@indiaaibrief.com?subject=Careers%20%E2%80%94%20general%20interest">
            Email hello@indiaaibrief.com
          </a>
        </Button>
      </section>

      <section className="mt-10 space-y-4 text-base leading-7 text-text-secondary">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          What we look for
        </h2>
        <p>
          We hire for India-first taste: people who can explain MeitY guidance,
          DPDP implications, and Tier-2 talent markets without pasting US tech
          narratives. Writers should be comfortable with answer-first structure,
          FAQ schema, and fact-checking funding or policy claims against primary
          sources. Product and engineering candidates should obsess over Core
          Web Vitals on mid-range Android devices, keep third-party scripts off
          the critical path, and treat dark mode and mobile as the default —
          not afterthoughts.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>India-first writing or product sense — not recycled US tech copy</li>
          <li>Obsession with LCP, CLS, and answer-first content structure</li>
          <li>Comfort with ambiguous sources and rigorous fact-checking</li>
          <li>Willingness to ship weekly and kill features that do not convert</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4 text-base leading-7 text-text-secondary">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          How we work
        </h2>
        <p>
          Editorial follows a Monday-to-Friday AI-assisted, human-verified
          workflow: strategy briefs, drafts, enrichment with original data, GEO
          structuring, then publish and distribute on X, LinkedIn, Telegram, and
          email. Product work prioritizes monetizable surfaces — compliance kit,
          readiness audit, subscriptions — without bloating the reading
          experience. Remote-friendly across India; async by default; meetings
          only when a decision is blocked.
        </p>
        <p>
          We do not run banner ad farms, chat widgets, or social embeds that
          wreck performance. If that culture fits you, introduce yourself even
          when this page says we are not hiring — strong cold pitches get
          replies.
        </p>
      </section>

      <p className="mt-10 text-sm text-text-tertiary">
        Prefer to read first?{" "}
        <Link href="/about" className="text-accent hover:text-accent-hover">
          About
        </Link>{" "}
        ·{" "}
        <Link href="/editorial" className="text-accent hover:text-accent-hover">
          Editorial policy
        </Link>{" "}
        ·{" "}
        <Link href="/contact" className="text-accent hover:text-accent-hover">
          Contact
        </Link>
      </p>
    </div>
  );
}
