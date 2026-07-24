import { redirect } from "next/navigation";
import { ArticlesManager } from "@/components/editorial/articles-manager";
import { EditorialNav } from "@/components/editorial/editorial-nav";
import { listDbArticles } from "@/lib/editorial/articles";
import { canAccessEditorial } from "@/lib/editorial/auth";
import { getAllPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Editorial Articles",
  description: "Create and edit published articles.",
  path: "/dashboard/editorial/articles",
  noIndex: true,
});

export default async function EditorialArticlesPage() {
  const allowed = await canAccessEditorial();
  if (!allowed) redirect("/dashboard");

  let dbArticles: Awaited<ReturnType<typeof listDbArticles>> = [];
  let error: string | null = null;

  try {
    dbArticles = await listDbArticles();
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : "Database unavailable. Set DATABASE_URL and run migrations.";
  }

  const mdxArticles = (await getAllPosts()).map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    url: p.url,
    publishedAt: p.publishedAt,
  }));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">
        Articles
      </h1>
      <p className="mt-1 text-text-secondary">
        Create/edit Supabase articles. Markdown tables and live figures are
        supported.
      </p>
      <div className="mt-6">
        <EditorialNav />
      </div>
      {error ? (
        <p className="mt-6 rounded-md border border-border bg-muted p-4 text-sm">
          {error}
        </p>
      ) : (
        <ArticlesManager
          dbArticles={dbArticles}
          mdxArticles={mdxArticles}
        />
      )}
    </div>
  );
}
