"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
  PolicyInstrument,
  PolicyJurisdiction,
  PolicyUpdate,
} from "@/types";
import { formatArticleDate, cn } from "@/lib/utils";

interface PolicyTrackerProps {
  updates: PolicyUpdate[];
  sectors: string[];
  instruments?: string[];
  advancedUnlocked: boolean;
}

type JurisdictionFilter = "all" | PolicyJurisdiction;
type InstrumentFilter = "all" | PolicyInstrument;

const INSTRUMENT_LABEL: Record<PolicyInstrument, string> = {
  legislation: "Legislation",
  rules: "Rules",
  guidelines: "Guidelines",
  mission: "Mission / Policy",
  sectoral: "Sectoral",
  advisory: "Advisory",
  court: "Court",
  industry: "Industry",
};

export function PolicyTracker({
  updates,
  sectors,
  instruments = [],
  advancedUnlocked,
}: PolicyTrackerProps) {
  const [query, setQuery] = useState("");
  const [jurisdiction, setJurisdiction] = useState<JurisdictionFilter>("all");
  const [instrument, setInstrument] = useState<InstrumentFilter>("all");
  const [sector, setSector] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return updates
      .filter((update) => {
        const matchesQuery =
          !q ||
          update.title.toLowerCase().includes(q) ||
          update.summary.toLowerCase().includes(q) ||
          update.jurisdictionLabel.toLowerCase().includes(q) ||
          (update.agency?.toLowerCase().includes(q) ?? false) ||
          update.tags.some((tag) => tag.toLowerCase().includes(q));

        const matchesJurisdiction =
          jurisdiction === "all" || update.jurisdiction === jurisdiction;

        const matchesInstrument =
          instrument === "all" || update.instrument === instrument;

        const matchesSector =
          !advancedUnlocked || sector === "all" || update.sector === sector;

        return (
          matchesQuery &&
          matchesJurisdiction &&
          matchesInstrument &&
          matchesSector
        );
      })
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
  }, [updates, query, jurisdiction, instrument, sector, advancedUnlocked]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 border border-border bg-surface p-4 md:grid-cols-3">
        <label className="block md:col-span-1">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-text-tertiary">
            Search
          </span>
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, agency, tag…"
            aria-label="Search policy updates"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-text-secondary">
            Level
          </span>
          <Select
            value={jurisdiction}
            onChange={(event) =>
              setJurisdiction(event.target.value as JurisdictionFilter)
            }
            aria-label="Filter by central or state"
          >
            <option value="all">All levels</option>
            <option value="central">Central</option>
            <option value="state">State</option>
          </Select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-text-secondary">
            Instrument
          </span>
          <Select
            value={instrument}
            onChange={(event) =>
              setInstrument(event.target.value as InstrumentFilter)
            }
            aria-label="Filter by instrument type"
          >
            <option value="all">All types</option>
            {(instruments.length
              ? instruments
              : Object.keys(INSTRUMENT_LABEL)
            ).map((key) => (
              <option key={key} value={key}>
                {INSTRUMENT_LABEL[key as PolicyInstrument] ?? key}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <section
        className={cn(
          "relative border border-border p-4",
          !advancedUnlocked && "bg-muted/40",
        )}
        aria-labelledby="advanced-policy-filters"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2
            id="advanced-policy-filters"
            className="text-sm font-semibold uppercase tracking-[0.05em] text-text-secondary"
          >
            Advanced filters
          </h2>
          {!advancedUnlocked ? (
            <span className="rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
              Brief+ subscribers
            </span>
          ) : null}
        </div>

        <div
          className={cn(
            "grid gap-4 md:grid-cols-2",
            !advancedUnlocked && "pointer-events-none select-none opacity-40",
          )}
          aria-disabled={!advancedUnlocked}
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-text-secondary">
              Sector
            </span>
            <Select
              value={sector}
              disabled={!advancedUnlocked}
              onChange={(event) => setSector(event.target.value)}
            >
              <option value="all">All sectors</option>
              {sectors.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </label>
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              disabled
              className="min-h-11 w-full md:w-auto"
              title="PDF export ships with Brief"
            >
              PDF export — Brief soon
            </Button>
          </div>
        </div>

        {!advancedUnlocked ? (
          <div className="mt-4 flex flex-col gap-3 border border-dashed border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-secondary">
              Sector filters unlock on Brief. Join the founding list — we email
              before any charge.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href="/sign-in?redirect_url=/policy">Sign in</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/subscribe">Join founding list</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <p className="text-sm text-text-secondary">
        Showing{" "}
        <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
        {updates.length} instruments
      </p>

      {filtered.length === 0 ? (
        <p className="border border-dashed border-border bg-surface p-8 text-center text-sm text-text-secondary">
          No policy instruments match these filters.
        </p>
      ) : (
        <ol className="relative space-y-0 border-l border-border pl-6">
          {filtered.map((update) => (
            <li key={update.slug} className="relative pb-10 last:pb-0">
              <span
                aria-hidden
                className="absolute -left-[1.625rem] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-background"
              />
              <time
                dateTime={update.publishedAt}
                className="text-xs font-medium uppercase tracking-[0.05em] text-text-tertiary"
              >
                {formatArticleDate(update.publishedAt)}
              </time>
              <div className="mt-2 border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-accent/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] text-accent">
                    {update.jurisdiction}
                  </span>
                  {update.instrument ? (
                    <span className="bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] text-text-secondary">
                      {INSTRUMENT_LABEL[update.instrument]}
                    </span>
                  ) : null}
                  {update.status ? (
                    <span className="text-[11px] uppercase tracking-[0.04em] text-text-tertiary">
                      {update.status}
                    </span>
                  ) : null}
                  <span className="text-xs text-text-tertiary">
                    {update.agency ?? update.jurisdictionLabel}
                  </span>
                  <span className="text-xs text-text-tertiary">·</span>
                  <span className="text-xs text-text-tertiary">{update.sector}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                  {update.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {update.summary}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {update.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted px-2 py-1 text-[11px] uppercase tracking-[0.04em] text-text-tertiary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={update.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-accent hover:text-accent-hover"
                >
                  Source →
                </a>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
