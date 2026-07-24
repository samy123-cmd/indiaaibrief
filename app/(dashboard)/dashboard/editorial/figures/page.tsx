import { redirect } from "next/navigation";
import { EditorialNav } from "@/components/editorial/editorial-nav";
import { FiguresManager } from "@/components/editorial/figures-manager";
import { canAccessEditorial } from "@/lib/editorial/auth";
import { listAllFigures } from "@/lib/editorial/figures";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Editorial Figures",
  description: "Live-editable India AI statistics and figures.",
  path: "/dashboard/editorial/figures",
  noIndex: true,
});

export default async function EditorialFiguresPage() {
  const allowed = await canAccessEditorial();
  if (!allowed) redirect("/dashboard");

  let items: Awaited<ReturnType<typeof listAllFigures>> = [];
  let error: string | null = null;

  try {
    items = await listAllFigures(true);
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : "Database unavailable. Run npm run db:migrate then db:seed-figures.";
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">
        Figures
      </h1>
      <p className="mt-1 text-text-secondary">
        Update market stats once — every article using{" "}
        <code className="text-xs">&lt;FigureTable /&gt;</code> stays current.
      </p>
      <div className="mt-6">
        <EditorialNav />
      </div>
      {error ? (
        <p className="mt-6 rounded-md border border-border bg-muted p-4 text-sm">
          {error}
        </p>
      ) : (
        <FiguresManager initialFigures={items} />
      )}
    </div>
  );
}
