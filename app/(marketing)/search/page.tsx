import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchSite } from "@/lib/search";

export const metadata = buildMetadata({
  title: "Search",
  description:
    "Search IndiaAIBrief articles, startups, playbooks, and products.",
  path: "/search",
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query.length >= 2 ? await searchSite(query) : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-[32px] font-extrabold tracking-[-0.02em] text-foreground">
        Search
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Articles, startups, and products across IndiaAIBrief.
      </p>

      <form
        action="/search"
        method="get"
        className="mt-6 flex flex-col gap-2 sm:flex-row"
      >
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search Indian AI intelligence…"
          aria-label="Search query"
          autoFocus
          minLength={2}
        />
        <Button type="submit">Search</Button>
      </form>

      {query.length > 0 && query.length < 2 ? (
        <p className="mt-8 text-sm text-text-secondary">
          Type at least 2 characters.
        </p>
      ) : null}

      {query.length >= 2 ? (
        <div className="mt-8">
          <p className="text-sm text-text-secondary">
            {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;
            {query}&rdquo;
          </p>
          {results.length === 0 ? (
            <p className="mt-4 text-sm text-text-secondary">
              Nothing matched. Try another keyword, or browse{" "}
              <Link href="/explains" className="text-accent hover:text-accent-hover">
                explainers
              </Link>{" "}
              and{" "}
              <Link href="/news" className="text-accent hover:text-accent-hover">
                news
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-border border border-border bg-surface">
              {results.map((hit) => (
                <li key={`${hit.type}-${hit.url}`}>
                  <Link
                    href={hit.url}
                    className="block px-4 py-4 transition-colors hover:bg-muted/60"
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.05em] text-accent">
                      {hit.meta ?? hit.type}
                    </p>
                    <p className="mt-1 font-semibold text-foreground">
                      {hit.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                      {hit.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
