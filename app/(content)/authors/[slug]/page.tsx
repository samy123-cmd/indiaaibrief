import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/content/article-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getAllAuthors } from "@/lib/authors";
import { getAllPosts, toArticleCardData } from "@/lib/content";
import { breadcrumbSchema, personSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllAuthors().map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = getAllAuthors().find((a) => a.slug === slug);
  if (!author) return {};

  return buildMetadata({
    title: `${author.name} — ${author.title}`,
    description: author.bio,
    path: `/authors/${author.slug}`,
    image: author.avatar,
    imageAlt: author.name,
    authors: [author.name],
    authorUrl: `/authors/${author.slug}`,
    authorTwitter: author.twitter?.includes("x.com/")
      ? `@${author.twitter.split("/").pop()}`
      : undefined,
  });
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = getAllAuthors().find((a) => a.slug === slug);
  if (!author) notFound();

  const authored = (await getAllPosts())
    .filter((post) => post.author === author.slug)
    .slice(0, 12)
    .map(toArticleCardData);

  const breadcrumbs = [
    { name: "Home", item: absoluteUrl("/") },
    { name: "Authors", item: absoluteUrl("/authors") },
    { name: author.name, item: absoluteUrl(`/authors/${author.slug}`) },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <JsonLd data={[personSchema(author), breadcrumbSchema(breadcrumbs)]} />

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
            <Link href="/authors" className="hover:text-accent">
              Authors
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-text-tertiary">{author.name}</li>
        </ol>
      </nav>

      <header className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start">
        <Image
          src={author.avatar}
          alt=""
          width={96}
          height={96}
                  className="h-24 w-24 rounded-full object-cover object-top"
        />
        <div>
          <h1 className="text-[32px] font-extrabold tracking-[-0.02em] text-foreground md:text-5xl">
            {author.name}
          </h1>
          <p className="mt-2 text-base font-medium text-accent">{author.title}</p>
          <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">
            {author.bio}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {author.twitter ? (
              <a
                href={author.twitter}
                className="font-medium text-accent hover:text-accent-hover"
                rel="noopener noreferrer"
              >
                Twitter / X
              </a>
            ) : null}
            {author.linkedin ? (
              <a
                href={author.linkedin}
                className="font-medium text-accent hover:text-accent-hover"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Latest from {author.name}
        </h2>
        {authored.length === 0 ? (
          <p className="mt-4 text-sm text-text-secondary">
            Articles by this author will appear here once published.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {authored.map((article) => (
              <ArticleCard key={article.url} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
