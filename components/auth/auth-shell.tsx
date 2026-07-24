import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/layout/brand-mark";

const MEMBER_PERKS = [
  "Weekly Brief in your inbox — India-first, not aggregated",
  "Startup & policy trackers with member filters on Brief",
  "Dashboard for bookmarks, kit downloads, and plan status",
] as const;

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Premium auth layout — brand atmosphere left, form right.
 * One composition on desktop; stacked on mobile.
 */
export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)]">
      <div className="mx-auto grid w-full max-w-6xl lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2">
        {/* Brand panel */}
        <aside className="relative overflow-hidden border-b border-border bg-[#0A0A0A] px-6 py-10 text-[#FAFAFA] lg:border-b-0 lg:border-r lg:px-12 lg:py-16 dark:border-border">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.28),transparent_55%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative flex h-full flex-col">
            <Link
              href="/"
              className="inline-flex w-fit items-center"
              aria-label="IndiaAIBrief home"
            >
              <BrandMark size={32} className="[&_span]:text-[#FAFAFA]" />
            </Link>

            <div className="mt-10 max-w-md lg:mt-auto lg:pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#F87171]">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-[28px] font-extrabold leading-9 tracking-[-0.02em] md:text-4xl md:leading-[44px]">
                Indian AI intelligence
                <span className="block text-[#A3A3A3]">for decision-makers.</span>
              </h1>
              <p className="mt-4 text-sm leading-6 text-[#A3A3A3]">
                Built for founders, CTOs, and policymakers who need signal — not
                another news aggregator.
              </p>

              <ul className="mt-8 space-y-3">
                {MEMBER_PERKS.map((perk) => (
                  <li
                    key={perk}
                    className="flex gap-3 text-sm leading-6 text-[#E5E5E5]"
                  >
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]"
                    />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="relative mt-10 hidden text-xs text-[#525252] lg:mt-auto lg:block">
              Free to join. No card required.
            </p>
          </div>
        </aside>

        {/* Form panel */}
        <section className="flex flex-col justify-center bg-background px-6 py-10 md:px-10 lg:px-14 lg:py-16">
          <div className="mx-auto w-full max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.02em] text-foreground md:text-[32px]">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {description}
            </p>

            <div className="mt-8">{children}</div>

            {footer ? <div className="mt-8">{footer}</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
