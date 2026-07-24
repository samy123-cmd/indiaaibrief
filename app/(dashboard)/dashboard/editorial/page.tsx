import { redirect } from "next/navigation";
import { EditorialNav } from "@/components/editorial/editorial-nav";
import { SignalsInbox } from "@/components/editorial/signals-inbox";
import { canAccessEditorial } from "@/lib/editorial/auth";
import { listSignals } from "@/lib/editorial/queries";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Editorial Inbox",
  description: "IndiaAIBrief signal inbox and publishing workflow.",
  path: "/dashboard/editorial",
  noIndex: true,
});

export default async function EditorialInboxPage() {
  const allowed = await canAccessEditorial();
  if (!allowed) redirect("/dashboard");

  let items: Awaited<ReturnType<typeof listSignals>>["items"] = [];
  let total = 0;
  let error: string | null = null;

  try {
    const result = await listSignals({
      status: ["new", "reviewing"],
      limit: 100,
    });
    items = result.items;
    total = result.total;
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : "Database unavailable. Set DATABASE_URL and run migrations.";
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">
        Editorial Inbox
      </h1>
      <p className="mt-1 text-text-secondary">
        Review Indian AI signals, draft, and publish.
      </p>
      <div className="mt-6">
        <EditorialNav />
      </div>
      {error ? (
        <p className="mt-6 rounded-md border border-border bg-muted p-4 text-sm">
          {error}
        </p>
      ) : (
        <SignalsInbox initialSignals={items} total={total} />
      )}
    </div>
  );
}
