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
        IndiaAIBrief is a small, performance-obsessed team. We are not hiring
        full-time roles right now — but we read every strong pitch.
      </p>

      <section className="mt-10 rounded-lg border border-dashed border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">
          No open roles today
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          When we open editorial or product seats, we post them here first. Until
          then, send a short note (5 sentences max) and 2–3 links to your best
          work.
        </p>
        <Button asChild className="mt-4" size="lg">
          <a href="mailto:hello@indiaaibrief.com?subject=Careers%20%E2%80%94%20general%20interest">
            Email hello@indiaaibrief.com
          </a>
        </Button>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">What we look for</h2>
        <ul className="mt-4 space-y-2 text-sm text-text-secondary">
          <li>• India-first writing or product taste — not US tech recycled</li>
          <li>• Obsession with Core Web Vitals and answer-first structure</li>
          <li>• Comfort with ambiguous sources and fact-checking claims</li>
        </ul>
      </section>

      <p className="mt-10 text-sm text-text-tertiary">
        Prefer to read first?{" "}
        <Link href="/about" className="text-accent hover:text-accent-hover">
          About
        </Link>{" "}
        ·{" "}
        <Link href="/editorial" className="text-accent hover:text-accent-hover">
          Editorial policy
        </Link>
      </p>
    </div>
  );
}
