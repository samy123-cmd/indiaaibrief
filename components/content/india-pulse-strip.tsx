import Link from "next/link";
import type { IndiaPulseStat } from "@/lib/india-figures";
import { cn } from "@/lib/utils";

interface IndiaPulseStripProps {
  stats: IndiaPulseStat[];
  title?: string;
  eyebrow?: string;
  footnoteHref?: string;
  footnoteLabel?: string;
  className?: string;
  variant?: "hero" | "cards" | "panels";
}

/**
 * India Watch–inspired figures strip.
 * Short values + mono labels — works without DB.
 */
export function IndiaPulseStrip({
  stats,
  title,
  eyebrow = "India by the numbers",
  footnoteHref = "/data/ai-in-india-market-statistics-2026",
  footnoteLabel = "see sourced India AI statistics →",
  className,
  variant = "hero",
}: IndiaPulseStripProps) {
  return (
    <section
      className={cn(
        "border-y border-border bg-surface",
        className,
      )}
      aria-labelledby="india-pulse-heading"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-12">
        {eyebrow ? (
          <p className="section-label mb-2">{eyebrow}</p>
        ) : null}
        {title ? (
          <h2
            id="india-pulse-heading"
            className="text-xl font-bold tracking-tight text-foreground md:text-2xl"
          >
            {title}
          </h2>
        ) : (
          <h2 id="india-pulse-heading" className="sr-only">
            India AI figures
          </h2>
        )}

        {variant === "hero" ? (
          <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
            {stats.map((stat) => {
              const inner = (
                <>
                  <p className="font-mono text-2xl font-bold tracking-tight text-accent tabular-nums sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-text-tertiary">
                    {stat.label}
                  </p>
                  {stat.detail ? (
                    <p className="mt-1 text-xs leading-snug text-text-secondary">
                      {stat.detail}
                    </p>
                  ) : null}
                </>
              );
              return stat.href ? (
                <Link
                  key={stat.key}
                  href={stat.href}
                  className="group min-h-[5.5rem] transition-colors hover:opacity-90"
                >
                  {inner}
                </Link>
              ) : (
                <div key={stat.key} className="min-h-[5.5rem]">
                  {inner}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={cn(
              "mt-6 grid gap-3",
              variant === "panels" ? "sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-4",
            )}
          >
            {stats.map((stat) => {
              const card = (
                <div
                  className={cn(
                    "flex h-full min-h-[7.5rem] flex-col border border-border bg-background p-5 sm:p-6",
                    "transition-colors hover:border-accent/50",
                  )}
                >
                  <p className="font-mono text-[1.75rem] font-bold tracking-tight text-accent tabular-nums sm:text-[2rem] leading-none">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-sm font-medium leading-snug text-foreground">
                    {stat.label}
                  </p>
                  {stat.detail ? (
                    <p className="mt-auto pt-3 text-xs leading-snug text-text-secondary">
                      {stat.detail}
                    </p>
                  ) : null}
                </div>
              );
              return stat.href ? (
                <Link key={stat.key} href={stat.href} className="block h-full">
                  {card}
                </Link>
              ) : (
                <div key={stat.key}>{card}</div>
              );
            })}
          </div>
        )}

        {footnoteHref ? (
          <p className="mt-6 text-xs text-text-tertiary">
            Directional industry signals —{" "}
            <Link
              href={footnoteHref}
              className="text-foreground underline-offset-2 hover:text-accent hover:underline"
            >
              {footnoteLabel}
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
