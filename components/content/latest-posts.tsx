import { ArticleCard, type ArticleCardData } from "@/components/content/article-card";

interface LatestPostsProps {
  initial: ArticleCardData[];
  more: ArticleCardData[];
}

/**
 * Latest posts — zero client JS.
 * Extra cards open via native <details> (no React hydration for this block).
 */
export function LatestPosts({ initial, more }: LatestPostsProps) {
  return (
    <div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {initial.map((article) => (
          <ArticleCard key={article.url} article={article} />
        ))}
      </div>
      {more.length > 0 ? (
        <details className="group mt-8">
          <summary className="mx-auto flex min-h-11 w-fit cursor-pointer list-none items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Load more</span>
            <span className="hidden group-open:inline">Showing more</span>
          </summary>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((article) => (
              <ArticleCard key={article.url} article={article} />
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
