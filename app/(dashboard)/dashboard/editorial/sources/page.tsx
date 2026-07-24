import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { EditorialNav } from "@/components/editorial/editorial-nav";
import { SourcesManager } from "@/components/editorial/sources-manager";
import { sources } from "@/drizzle/schema";
import { canAccessEditorial } from "@/lib/editorial/auth";
import { getDb } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Editorial Sources",
  description: "Manage signal ingestion sources.",
  path: "/dashboard/editorial/sources",
  noIndex: true,
});

export default async function EditorialSourcesPage() {
  const allowed = await canAccessEditorial();
  if (!allowed) redirect("/dashboard");

  let items: (typeof sources.$inferSelect)[] = [];
  let error: string | null = null;

  try {
    const db = getDb();
    items = await db.select().from(sources).orderBy(desc(sources.updatedAt));
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : "Database unavailable. Set DATABASE_URL and run migrations.";
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">
        Sources
      </h1>
      <p className="mt-1 text-text-secondary">
        RSS, scrape, and manual signal sources.
      </p>
      <div className="mt-6">
        <EditorialNav />
      </div>
      {error ? (
        <p className="mt-6 rounded-md border border-border bg-muted p-4 text-sm">
          {error}
        </p>
      ) : (
        <SourcesManager initialSources={items} />
      )}
    </div>
  );
}
