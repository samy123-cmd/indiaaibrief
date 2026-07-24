import type { EditorialAnalytics } from "@/lib/editorial/types";

interface AnalyticsPanelProps {
  data: EditorialAnalytics;
}

function BarRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const width = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-text-secondary">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-accent"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function AnalyticsPanel({ data }: AnalyticsPanelProps) {
  const catMax = Math.max(1, ...data.categoryBreakdown.map((c) => c.count));
  const impactMax = Math.max(1, ...data.impactBreakdown.map((c) => c.count));
  const sourceMax = Math.max(1, ...data.topSources.map((c) => c.count));

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Today", data.signalsToday],
          ["This week", data.signalsThisWeek],
          ["This month", data.signalsThisMonth],
          ["Published", data.publishedCount],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <p className="text-xs uppercase tracking-wide text-text-tertiary">
              {label}
            </p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
            Category breakdown
          </h2>
          <div className="mt-4 space-y-3">
            {data.categoryBreakdown.map((row) => (
              <BarRow
                key={row.category}
                label={row.category}
                value={row.count}
                max={catMax}
              />
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
            Impact distribution
          </h2>
          <div className="mt-4 space-y-3">
            {data.impactBreakdown.map((row) => (
              <BarRow
                key={row.impactLevel}
                label={row.impactLevel}
                value={row.count}
                max={impactMax}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
          Top sources
        </h2>
        <div className="mt-4 space-y-3">
          {data.topSources.map((row) => (
            <BarRow
              key={row.source}
              label={row.source}
              value={row.count}
              max={sourceMax}
            />
          ))}
        </div>
      </section>

      <p className="text-sm text-text-secondary">
        Inbox: {data.inboxCount} · Avg hours signal→publish:{" "}
        {data.avgHoursSignalToPublish == null
          ? "n/a"
          : data.avgHoursSignalToPublish.toFixed(1)}
      </p>
    </div>
  );
}
