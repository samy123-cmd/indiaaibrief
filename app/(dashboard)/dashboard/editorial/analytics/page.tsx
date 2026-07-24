import { redirect } from "next/navigation";
import { AnalyticsPanel } from "@/components/editorial/analytics-panel";
import { EditorialNav } from "@/components/editorial/editorial-nav";
import { canAccessEditorial } from "@/lib/editorial/auth";
import { getEditorialAnalytics } from "@/lib/editorial/queries";
import type { EditorialAnalytics } from "@/lib/editorial/types";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Editorial Analytics",
  description: "Signal ingestion and publish analytics.",
  path: "/dashboard/editorial/analytics",
  noIndex: true,
});

const EMPTY: EditorialAnalytics = {
  signalsToday: 0,
  signalsThisWeek: 0,
  signalsThisMonth: 0,
  publishedCount: 0,
  avgHoursSignalToPublish: null,
  topSources: [],
  categoryBreakdown: [],
  impactBreakdown: [],
  inboxCount: 0,
};

export default async function EditorialAnalyticsPage() {
  const allowed = await canAccessEditorial();
  if (!allowed) redirect("/dashboard");

  let data = EMPTY;
  let error: string | null = null;

  try {
    data = await getEditorialAnalytics();
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : "Database unavailable. Set DATABASE_URL and run migrations.";
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">
        Editorial Analytics
      </h1>
      <p className="mt-1 text-text-secondary">
        Volume, latency, and source performance.
      </p>
      <div className="mt-6">
        <EditorialNav />
      </div>
      {error ? (
        <p className="mt-6 rounded-md border border-border bg-muted p-4 text-sm">
          {error}
        </p>
      ) : (
        <AnalyticsPanel data={data} />
      )}
    </div>
  );
}
