import Link from "next/link";
import Image from "next/image";
import { ArticleCard } from "@/components/content/article-card";
import { IndiaPulseStrip } from "@/components/content/india-pulse-strip";
import { LatestPosts } from "@/components/content/latest-posts";
import { NewsletterCTA } from "@/components/content/newsletter-cta";
import { NewsletterForm } from "@/components/content/newsletter-form";
import { ProductCta } from "@/components/products/product-cta";
import { Button } from "@/components/ui/button";
import {
  getAllPosts,
  getTrendingPosts,
  toArticleCardData,
} from "@/lib/content";
import {
  INDIA_KEY_TRACKERS,
  INDIA_PULSE_HERO,
} from "@/lib/india-figures";
import { SEED_STARTUPS } from "@/lib/seed-data";
import { buildMetadata, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Indian AI Intelligence for Decision-Makers",
  description:
    "Breaking news, original analysis, and actionable intelligence on India's AI ecosystem. For founders, CTOs, and policymakers.",
  path: "/",
});

export default async function HomePage() {
  const allPosts = await getAllPosts();
  const trending = (await getTrendingPosts(5)).map(toArticleCardData);
  const latest = allPosts.map(toArticleCardData);
  const latestInitial = latest.slice(0, 6);
  const latestMore = latest.slice(6, 12);
  const playbooks = allPosts
    .filter((post) => post.category === "playbooks")
    .slice(0, 3)
    .map(toArticleCardData);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_55%)]"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 md:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-accent">
            {SITE_NAME}
          </p>
          <h1 className="max-w-3xl text-[32px] font-extrabold leading-10 tracking-[-0.02em] text-foreground md:text-5xl md:leading-[56px]">
            {SITE_TAGLINE}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-text-secondary">
            Original angles, structured answers, and products you can buy today —
            built for Indian decision-makers, not aggregators.
          </p>
          <div className="max-w-xl">
            <NewsletterForm source="homepage-hero" />
            <p className="mt-2 text-xs text-text-tertiary">
              Free weekly brief. Unsubscribe anytime.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/subscribe">View plans</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/kit/ai-compliance">Compliance Kit — ₹999</Link>
            </Button>
          </div>
        </div>
      </section>

      <IndiaPulseStrip
        stats={INDIA_PULSE_HERO}
        eyebrow="India AI Watch"
        title="Ecosystem pulse"
        variant="hero"
      />

      {trending.length > 0 ? (
        <section className="cv-auto mx-auto w-full max-w-6xl px-4 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-4xl">
                Trending
              </h2>
              <p className="mt-2 text-text-secondary">
                Answer-first briefs built for Indian decision-makers.
              </p>
            </div>
            <Link
              href="/news"
              className="hidden min-h-11 items-center text-sm font-medium text-accent hover:text-accent-hover sm:inline-flex"
            >
              View all
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((article, index) => (
              <ArticleCard
                key={article.url}
                article={article}
                priority={index === 0}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="cv-auto border-t border-border bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-4xl">
                Latest
              </h2>
              <p className="mt-2 text-text-secondary">
                Newest intelligence across news, explainers, and playbooks.
              </p>
            </div>
            <Link
              href="/news"
              className="hidden min-h-11 items-center text-sm font-medium text-accent hover:text-accent-hover sm:inline-flex"
            >
              Browse news
            </Link>
          </div>
          {latestInitial.length > 0 ? (
            <LatestPosts initial={latestInitial} more={latestMore} />
          ) : (
            <p className="mt-8 text-sm text-text-secondary">
              Articles publish from the editorial pipeline.
            </p>
          )}
        </div>
      </section>

      {playbooks.length > 0 ? (
        <section className="cv-auto border-t border-border bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-12">
            <div className="flex items-end justify-between gap-4">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  Featured playbooks
                </h2>
                <p className="mt-2 text-text-secondary">
                  Implementation checklists that turn Indian AI policy and tooling
                  into action for MSMEs and product teams.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="hidden sm:inline-flex"
              >
                <Link href="/playbooks">All playbooks</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {playbooks.map((article) => (
                <ArticleCard key={article.url} article={article} />
              ))}
            </div>
            <Button asChild size="lg" className="mt-8 sm:hidden">
              <Link href="/playbooks">All playbooks</Link>
            </Button>
          </div>
        </section>
      ) : null}

      <section className="cv-auto border-t border-border bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-4xl">
                Startup Tracker
              </h2>
              <p className="mt-2 text-text-secondary">
                Recent Indian AI companies — city, sector, and last funding.
              </p>
            </div>
            <Link
              href="/startups"
              className="hidden min-h-11 items-center text-sm font-medium text-accent hover:text-accent-hover sm:inline-flex"
            >
              Open tracker
            </Link>
          </div>
          <ul className="mt-8 divide-y divide-border border border-border bg-surface">
            {SEED_STARTUPS.slice(0, 5).map((startup) => (
              <li key={startup.slug}>
                <Link
                  href={`/startups/${startup.slug}`}
                  className="flex flex-col gap-1 px-4 py-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={startup.logo}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-md object-cover"
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        {startup.name}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {startup.city} · {startup.sector} · {startup.stage}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-text-secondary">
                    {startup.lastFunding}
                    <span className="ml-2 text-text-tertiary">
                      {startup.lastFundingDate}
                    </span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <IndiaPulseStrip
        stats={INDIA_KEY_TRACKERS}
        eyebrow="What to track"
        title="Policy, buyers, language, data"
        variant="cards"
      />

      <section className="cv-auto border-t border-border bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <NewsletterCTA variant="inline" source="homepage-inline" />
        </div>
      </section>

      <section className="cv-auto border-t border-border bg-background">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 md:grid-cols-2">
          <ProductCta variant="kit" />
          <ProductCta variant="subscribe" />
        </div>
      </section>
    </div>
  );
}
