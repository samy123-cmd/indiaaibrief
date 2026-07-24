import Link from "next/link";
import { NewsletterForm } from "@/components/content/newsletter-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "The Brief — Newsletter",
  description:
    "Weekly Indian AI intelligence for founders, CTOs, and policymakers. Subscribe free.",
  path: "/newsletter",
});

export default function NewsletterPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <Badge variant="outline">Weekly</Badge>
      <h1 className="mt-3 text-[32px] font-extrabold tracking-[-0.02em] md:text-5xl">
        The Brief
      </h1>
      <p className="mt-3 text-base leading-7 text-text-secondary">
        One email a week: what changed in Indian AI, why it matters for operators,
        and what to do next. We skip wire-copy aggregation and lead with a direct
        answer you can brief a founder or CIO on in under a minute.
      </p>

      <section className="mt-8 space-y-3 text-base leading-7 text-text-secondary">
        <h2 className="text-xl font-semibold text-foreground">What you get</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>Policy and MeitY signals that affect compliance calendars</li>
          <li>Funding and startup moves with India-relevant terms</li>
          <li>Links into explainers, comparisons, and playbooks — not dead ends</li>
          <li>No banner ads in the email; unsubscribe anytime</li>
        </ul>
        <p>
          Free subscribers get The Brief. Paid{" "}
          <Link href="/subscribe" className="text-accent hover:text-accent-hover">
            Brief and Intelligence
          </Link>{" "}
          founding lists open when UPI checkout ships — join those lists on the
          subscribe page without being charged today.
        </p>
      </section>

      <div className="mt-8 rounded-lg border border-border bg-surface p-5 md:p-6">
        <h2 className="text-lg font-semibold">Subscribe free</h2>
        <p className="mt-1 text-sm text-text-secondary">
          No spam. We use Buttondown for delivery. Founding members for paid Brief
          get early access when checkout opens.
        </p>
        <NewsletterForm source="newsletter-archive" className="mt-4" />
      </div>

      <div className="mt-10 rounded-lg border border-dashed border-border p-6">
        <h2 className="text-base font-semibold text-foreground">Archive</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Issue archive fills as we send. Until the first edition, read the open
          library — explainers and news stay free on the site. Past issues will
          list here with dates and short summaries for SEO and catch-up reading.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/explains">Explainers</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/news">News</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/subscribe">Membership</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
