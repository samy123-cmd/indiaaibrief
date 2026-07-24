import { NewsletterForm } from "@/components/content/newsletter-form";
import { NewsletterStickyBar } from "@/components/content/newsletter-sticky-bar";
import { cn } from "@/lib/utils";

interface NewsletterCtaProps {
  variant?: "inline" | "sticky";
  source?: string;
  className?: string;
  title?: string;
  description?: string;
}

/**
 * Newsletter CTA — Server Component shell.
 * Inline: in-flow block. Sticky: mobile bottom bar (client dismiss only).
 * Form interactivity lives in NewsletterForm (client).
 */
export function NewsletterCTA({
  variant = "inline",
  source = "newsletter-cta",
  className,
  title = "Get The Brief",
  description = "Weekly Indian AI intelligence for founders, CTOs, and policymakers. No fluff. No aggregation.",
}: NewsletterCtaProps) {
  if (variant === "sticky") {
    return (
      <NewsletterStickyBar
        source={source}
        title={title}
        description={description}
      />
    );
  }

  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-surface p-5 md:p-6",
        className,
      )}
      aria-labelledby="newsletter-cta-heading"
    >
      <h2
        id="newsletter-cta-heading"
        className="text-xl font-semibold tracking-tight text-foreground md:text-2xl"
      >
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
        {description}
      </p>
      <NewsletterForm source={source} className="mt-4 max-w-xl" />
      <p className="mt-3 text-xs text-text-tertiary">
        Free. Unsubscribe anytime. Powered by Buttondown.
      </p>
    </section>
  );
}
