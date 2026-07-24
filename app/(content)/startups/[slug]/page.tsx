import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { getAllPosts } from "@/lib/content";
import { getStartupBySlug, SEED_STARTUPS } from "@/lib/seed-data";
import { breadcrumbSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, formatArticleDate, formatInr } from "@/lib/utils";

export const revalidate = 3600;

export function generateStaticParams() {
  return SEED_STARTUPS.map((startup) => ({ slug: startup.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const startup = getStartupBySlug(slug);
  if (!startup) return {};
  return buildMetadata({
    title: `${startup.name} — Indian AI startup profile`,
    description: startup.summary,
    path: `/startups/${startup.slug}`,
    image: startup.logo,
  });
}

export default async function StartupDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const startup = getStartupBySlug(slug);
  if (!startup) notFound();

  const related = (await getAllPosts())
    .filter((post) => {
      const hay = `${post.title} ${post.tags.join(" ")} ${post.excerpt}`.toLowerCase();
      return (
        hay.includes(startup.name.toLowerCase()) ||
        startup.tags.some((tag) => hay.includes(tag.toLowerCase()))
      );
    })
    .slice(0, 3);

  const breadcrumbs = [
    { name: "Home", item: absoluteUrl("/") },
    { name: "Startups", item: absoluteUrl("/startups") },
    { name: startup.name, item: absoluteUrl(`/startups/${startup.slug}`) },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
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
          <li>
            <Link href="/startups" className="hover:text-accent">
              Startups
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-text-tertiary">{startup.name}</li>
        </ol>
      </nav>

      <div className="mt-6 flex items-start gap-4">
        <Image
          src={startup.logo}
          alt=""
          width={72}
          height={72}
          className="h-[72px] w-[72px] rounded-xl object-cover"
        />
        <div>
          <Badge variant="outline" className="uppercase tracking-[0.04em]">
            {startup.stage}
          </Badge>
          <h1 className="mt-2 text-[32px] font-extrabold tracking-[-0.02em] md:text-5xl">
            {startup.name}
          </h1>
          <p className="mt-2 text-text-secondary">
            {startup.city} · {startup.sector} · Founded {startup.foundedYear}
          </p>
        </div>
      </div>

      <p className="mt-6 text-base leading-7 text-text-secondary">
        {startup.summary}
      </p>

      <section className="mt-8 space-y-3 text-base leading-7 text-text-secondary">
        <h2 className="text-xl font-semibold text-foreground">
          Why this profile matters
        </h2>
        <p>
          IndiaAIBrief startup profiles are decision briefs for founders, CTOs,
          and investors — not directory stubs. We surface stage, city, sector,
          last disclosed funding, and team-size bands so you can compare{" "}
          {startup.name} against peers in {startup.sector} without opening ten
          tabs. Always verify amounts against primary filings before investment
          or vendor selection.
        </p>
        <p>
          Use the Startup Tracker filters on{" "}
          <Link href="/startups" className="text-accent hover:text-accent-hover">
            /startups
          </Link>{" "}
          to find similar companies by city or stage, then read related news and
          explainers linked below when we have coverage.
        </p>
      </section>

      <dl className="mt-8 grid gap-4 border border-border bg-surface p-5 font-mono text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-[0.05em] text-text-tertiary">
            Last funding
          </dt>
          <dd className="mt-1 font-semibold text-foreground">
            {startup.lastFunding}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.05em] text-text-tertiary">
            Funding date
          </dt>
          <dd className="mt-1 font-semibold text-foreground">
            {formatArticleDate(startup.lastFundingDate)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.05em] text-text-tertiary">
            Amount (INR)
          </dt>
          <dd className="mt-1 font-semibold text-foreground">
            {formatInr(startup.lastFundingAmountInr)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.05em] text-text-tertiary">
            Team size
          </dt>
          <dd className="mt-1 font-semibold text-foreground">
            {startup.employees}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        {startup.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-muted px-2 py-1 text-[11px] uppercase tracking-[0.04em] text-text-tertiary"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <a href={startup.website} target="_blank" rel="noopener noreferrer">
            Visit website
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/startups">Back to tracker</Link>
        </Button>
      </div>

      {related.length > 0 ? (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="text-xl font-bold tracking-tight">Related coverage</h2>
          <ul className="mt-4 space-y-3">
            {related.map((post) => (
              <li key={post.url}>
                <Link
                  href={post.url}
                  className="font-medium text-accent hover:text-accent-hover"
                >
                  {post.title}
                </Link>
                <p className="text-sm text-text-secondary">{post.excerpt}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-10 text-xs text-text-tertiary">
        Tracker preview data — verify figures against primary sources before
        investment decisions. Want alerts?{" "}
        <Link href="/subscribe" className="text-accent hover:text-accent-hover">
          Join The Brief founding list
        </Link>
        .
      </p>
    </div>
  );
}
