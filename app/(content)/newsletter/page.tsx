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
        and what to do next. Past issues will appear here as we publish.
      </p>

      <div className="mt-8 rounded-lg border border-border bg-surface p-5 md:p-6">
        <h2 className="text-lg font-semibold">Subscribe free</h2>
        <p className="mt-1 text-sm text-text-secondary">
          No spam. Unsubscribe anytime. Founding members for paid Brief get early
          access when checkout opens.
        </p>
        <NewsletterForm source="newsletter-archive" className="mt-4" />
      </div>

      <div className="mt-10 rounded-lg border border-dashed border-border p-6">
        <h2 className="text-base font-semibold text-foreground">Archive</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Issue archive is empty until the first send. Meanwhile, read the open
          library.
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
