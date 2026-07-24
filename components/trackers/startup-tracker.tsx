"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StartupCard } from "@/components/trackers/startup-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Startup } from "@/types";
import { cn } from "@/lib/utils";

interface StartupTrackerProps {
  startups: Startup[];
  cities: string[];
  sectors: string[];
  stages: string[];
  advancedUnlocked: boolean;
}

export function StartupTracker({
  startups,
  cities,
  sectors,
  stages,
  advancedUnlocked,
}: StartupTrackerProps) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [sector, setSector] = useState("all");
  const [stage, setStage] = useState("all");
  const [fundedAfter, setFundedAfter] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return startups.filter((startup) => {
      const matchesQuery =
        !q ||
        startup.name.toLowerCase().includes(q) ||
        startup.summary.toLowerCase().includes(q) ||
        startup.tags.some((tag) => tag.toLowerCase().includes(q));

      const matchesCity = city === "all" || startup.city === city;
      const matchesSector = sector === "all" || startup.sector === sector;

      const matchesStage =
        !advancedUnlocked || stage === "all" || startup.stage === stage;

      const matchesDate =
        !advancedUnlocked ||
        !fundedAfter ||
        new Date(startup.lastFundingDate).getTime() >=
          new Date(fundedAfter).getTime();

      return (
        matchesQuery &&
        matchesCity &&
        matchesSector &&
        matchesStage &&
        matchesDate
      );
    });
  }, [
    startups,
    query,
    city,
    sector,
    stage,
    fundedAfter,
    advancedUnlocked,
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 rounded-lg border border-border bg-surface p-4 md:grid-cols-3">
        <label className="block md:col-span-3">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-text-tertiary">
            Search
          </span>
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, tags, or summary"
            aria-label="Search startups"
          />
        </label>

        <FilterSelect
          label="City"
          value={city}
          onChange={setCity}
          options={cities}
        />
        <FilterSelect
          label="Sector"
          value={sector}
          onChange={setSector}
          options={sectors}
        />
        <div className="flex items-end">
          <p className="pb-2 text-sm text-text-secondary">
            Showing{" "}
            <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            of {startups.length}
          </p>
        </div>
      </div>

      <section
        className={cn(
          "relative rounded-lg border border-border p-4",
          !advancedUnlocked && "bg-muted/40",
        )}
        aria-labelledby="advanced-startup-filters"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2
            id="advanced-startup-filters"
            className="text-sm font-semibold uppercase tracking-[0.05em] text-text-secondary"
          >
            Advanced filters
          </h2>
          {!advancedUnlocked ?
            <span className="rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
              Brief+ subscribers
            </span>
          : null}
        </div>

        <div
          className={cn(
            "grid gap-4 md:grid-cols-2",
            !advancedUnlocked && "pointer-events-none select-none opacity-40",
          )}
          aria-disabled={!advancedUnlocked}
        >
          <FilterSelect
            label="Funding stage"
            value={stage}
            onChange={setStage}
            options={stages}
            disabled={!advancedUnlocked}
          />
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-text-tertiary">
              Funded after
            </span>
            <Input
              type="date"
              value={fundedAfter}
              onChange={(event) => setFundedAfter(event.target.value)}
              disabled={!advancedUnlocked}
              aria-label="Filter by funded after date"
            />
          </label>
        </div>

        {!advancedUnlocked ?
          <div className="mt-4 flex flex-col gap-3 rounded-md border border-dashed border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-secondary">
              Stage and date filters unlock on Brief. Join the founding list —
              no charge until checkout opens.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href="/sign-in?redirect_url=/startups">Sign in</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/subscribe">Join founding list</Link>
              </Button>
            </div>
          </div>
        : null}
      </section>

      {filtered.length === 0 ?
        <p className="rounded-lg border border-dashed border-border bg-surface p-8 text-center text-sm text-text-secondary">
          No startups match these filters. Clear search or widen city/sector.
        </p>
      : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((startup) => (
            <StartupCard key={startup.slug} startup={startup} />
          ))}
        </div>}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-text-tertiary">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-11 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
