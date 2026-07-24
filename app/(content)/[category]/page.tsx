import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/content/article-card";
import { NewsletterCTA } from "@/components/content/newsletter-cta";
import { ProductCta } from "@/components/products/product-cta";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { CATEGORY_COPY } from "@/lib/categories";
import {
  CONTENT_CATEGORIES,
  getAllPosts,
  isContentCategory,
  toArticleCardData,
} from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";
import { buildMetadata, categoryPageTitle } from "@/lib/seo";
import { absoluteUrl, cn } from "@/lib/utils";
import type { ContentCategory } from "@/types";

const PAGE_SIZE = 12;

export const revalidate = 60;
export const dynamicParams = false;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string; tag?: string }>;
}

export function generateStaticParams() {
  return CONTENT_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categoryParam } = await params;
  const { page: pageParam, tag: tagParam } = await searchParams;
  if (!isContentCategory(categoryParam)) return {};

  const copy = CATEGORY_COPY[categoryParam];
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const tag = tagParam?.trim() || null;

  // Tag filters are not SEO-significant — canonical to base category.
  // Paginated pages self-canonical (?page=N).
  const canonicalPath =
    tag ? copy.path
    : page > 1 ? `${copy.path}?page=${page}`
    : copy.path;

  const description =
    page > 1
      ? `${copy.description} Page ${page} of the ${copy.title} archive.`
      : tag
        ? `${copy.description} Filtered by tag: ${tag}.`
        : copy.description;

  return buildMetadata({
    title: categoryPageTitle(copy.title, page, tag),
    description,
    path: canonicalPath,
    // Tag filters are utility UI — do not index thin filtered URL variants.
    noIndex: Boolean(tag),
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: categoryParam } = await params;
  const { page: pageParam, tag: tagParam } = await searchParams;

  if (!isContentCategory(categoryParam)) {
    notFound();
  }

  const category = categoryParam as ContentCategory;
  const copy = CATEGORY_COPY[category];
  const allPosts = await getAllPosts(category);
  const tags = Array.from(
    new Set(allPosts.flatMap((post) => post.tags)),
  ).sort();

  const activeTag = tagParam?.trim() || null;
  const filtered =
    activeTag ?
      allPosts.filter((post) => post.tags.includes(activeTag))
    : allPosts;

  const featured = filtered.filter((post) => post.featured);
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pagePosts = filtered
    .slice(start, start + PAGE_SIZE)
    .map(toArticleCardData);

  const breadcrumbs = [
    { name: "Home", item: absoluteUrl("/") },
    { name: copy.title, item: absoluteUrl(copy.path) },
  ];

  function hrefFor(nextPage: number, tag: string | null = activeTag) {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `${copy.path}?${qs}` : copy.path;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      <nav
        aria-label="Breadcrumb"
        className="text-xs font-medium uppercase tracking-[0.05em] text-text-secondary"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-text-tertiary">{copy.title}</li>
        </ol>
      </nav>

      <Badge variant="outline" className="mt-6 uppercase">
        {category}
      </Badge>
      <h1 className="mt-3 text-[32px] font-extrabold tracking-[-0.02em] md:text-5xl md:leading-[56px]">
        {copy.title}
        {currentPage > 1 ? (
          <span className="text-text-tertiary"> — Page {currentPage}</span>
        ) : null}
      </h1>
      <p className="mt-3 max-w-2xl text-text-secondary">{copy.description}</p>
      <div className="prose-article mt-6 max-w-3xl !px-0 !py-0">
        <p className="!mt-0 text-base !leading-7 text-text-secondary">
          {copy.seoText}
        </p>
      </div>

      {featured.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Featured
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((post, index) => (
              <ArticleCard
                key={post.url}
                article={toArticleCardData(post)}
                priority={index === 0}
              />
            ))}
          </div>
        </section>
      ) : null}

      {tags.length > 0 ? (
        <div className="mt-10 flex flex-wrap gap-2">
          <Link
            href={hrefFor(1, null)}
            className={cn(
              "inline-flex min-h-11 items-center rounded-md border px-3 text-sm",
              !activeTag
                ? "border-accent bg-accent text-primary-foreground"
                : "border-border bg-surface text-text-secondary hover:border-accent",
            )}
          >
            All
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={hrefFor(1, tag)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-md border px-3 text-sm",
                activeTag === tag
                  ? "border-accent bg-accent text-primary-foreground"
                  : "border-border bg-surface text-text-secondary hover:border-accent",
              )}
            >
              {tag}
            </Link>
          ))}
        </div>
      ) : null}

      <section className="mt-10">
        <h2 className="sr-only">Articles</h2>
        {pagePosts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center text-sm text-text-secondary">
            No articles yet in this category
            {activeTag ? ` for tag “${activeTag}”` : ""}. Check back soon.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pagePosts.map((article) => (
              <ArticleCard key={article.url} article={article} />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <nav
            aria-label="Pagination"
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            {currentPage > 1 ? (
              <Link
                href={hrefFor(currentPage - 1)}
                rel="prev"
                className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm hover:border-accent"
              >
                Previous
              </Link>
            ) : null}
            <span className="text-sm text-text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link
                href={hrefFor(currentPage + 1)}
                rel="next"
                className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm hover:border-accent"
              >
                Next
              </Link>
            ) : null}
          </nav>
        ) : null}
      </section>

      <div className="mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        <NewsletterCTA
          variant="inline"
          source={`category-${category}`}
          className="md:col-span-2"
        />
        <ProductCta variant={category === "playbooks" ? "kit" : "subscribe"} />
      </div>
    </div>
  );
}
