import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/content/ad-slot";
import { ArticleCard } from "@/components/content/article-card";
import { ArticleNewsletterSlot } from "@/components/content/article-newsletter-slot";
import { mdxComponents } from "@/components/content/mdx-components";
import { mdxOptions } from "@/lib/mdx";
import { ShareButtons } from "@/components/content/share-buttons";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { getAuthor } from "@/lib/authors";
import { CATEGORY_COPY } from "@/lib/categories";
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  isContentCategory,
  toArticleCardData,
} from "@/lib/content";
import {
  breadcrumbSchema,
  faqPageSchema,
  newsArticleSchema,
  organizationSchema,
  personSchema,
} from "@/lib/schema";
import { articleTitle, buildMetadata } from "@/lib/seo";
import {
  absoluteUrl,
  categoryLabel,
  formatArticleDate,
  readingTimeLabel,
} from "@/lib/utils";
import type { ContentCategory } from "@/types";

interface ArticlePageProps {
  params: Promise<{ category: string; slug: string }>;
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    category: post.category,
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { category, slug } = await params;
  if (!isContentCategory(category)) return {};

  const post = await getPostBySlug(category, slug);
  if (!post) return {};

  const author = getAuthor(post.author);

  return buildMetadata({
    title: articleTitle(post.title),
    description: post.description,
    path: post.url,
    image: post.image,
    imageAlt: post.imageAlt,
    type: "article",
    publishedAt: post.publishedAt,
    modifiedAt: post.modifiedAt,
    authors: [author.name],
    authorUrl: author.url,
    authorTwitter: author.twitter?.includes("x.com/")
      ? `@${author.twitter.split("/").pop()}`
      : undefined,
    section: post.category,
    tags: post.tags,
    readingTimeMinutes: post.readingTime,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { category: categoryParam, slug } = await params;

  if (!isContentCategory(categoryParam)) {
    notFound();
  }

  const category = categoryParam as ContentCategory;
  const post = await getPostBySlug(category, slug);

  if (!post) {
    notFound();
  }

  const author = getAuthor(post.author);
  const related = (await getRelatedPosts(category, slug, 3)).map(
    toArticleCardData,
  );
  const categoryCopy = CATEGORY_COPY[category];
  const breadcrumbs = [
    { name: "Home", item: absoluteUrl("/") },
    { name: categoryCopy.title, item: absoluteUrl(categoryCopy.path) },
    { name: post.title, item: absoluteUrl(post.url) },
  ];

  const schemas = [
    newsArticleSchema(post, author),
    personSchema(author),
    organizationSchema(),
    breadcrumbSchema(breadcrumbs),
  ];

  if (post.structuredData?.faq?.length) {
    schemas.push(faqPageSchema(post.structuredData.faq));
  }

  const socialHref = author.linkedin ?? author.twitter;

  return (
    <article
      className="pb-12"
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      <JsonLd data={schemas} />

      <div className="mx-auto w-full max-w-[680px] px-4 pt-8">
        <nav aria-label="Breadcrumb" className="text-xs font-medium uppercase tracking-[0.05em] text-text-secondary">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-accent">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={categoryCopy.path} className="hover:text-accent">
                {categoryCopy.title}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="line-clamp-1 text-text-tertiary">{post.title}</li>
          </ol>
        </nav>

        <Badge
          variant="outline"
          className="mt-6 border-transparent bg-transparent px-0 text-[12px] font-medium uppercase tracking-[0.05em] text-accent"
        >
          {categoryLabel(post.category)}
        </Badge>

        <h1
          itemProp="headline"
          className="mt-3 text-[32px] font-extrabold leading-10 tracking-[-0.02em] text-foreground md:text-5xl md:leading-[56px]"
        >
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-text-secondary">
          <time itemProp="datePublished" dateTime={post.publishedAt}>
            Published {formatArticleDate(post.publishedAt)}
          </time>
          <span aria-hidden>·</span>
          <time itemProp="dateModified" dateTime={post.modifiedAt}>
            Updated {formatArticleDate(post.modifiedAt)}
          </time>
          <span aria-hidden>·</span>
          <span>{readingTimeLabel(post.readingTime)}</span>
        </div>

        <div className="mt-4">
          <ShareButtons title={post.title} url={post.url} />
        </div>

        <AdSlot slot="below-title" className="hidden md:flex" />
      </div>

      <div className="mx-auto mt-8 w-full max-w-[1200px] px-4">
        <div className="overflow-hidden rounded-lg border border-border bg-muted">
          <Image
            src={post.image}
            alt={post.imageAlt}
            width={1200}
            height={630}
            priority
            loading="eager"
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="h-auto w-full object-cover"
            itemProp="image"
          />
        </div>
      </div>

      <div
        className="prose-article mx-auto mt-8 w-full px-4"
        itemProp="articleBody"
      >
        <MDXRemote
          source={post.body}
          components={mdxComponents}
          options={mdxOptions}
        />

        <AdSlot slot="below-article" />

        <ArticleNewsletterSlot source={`article-${post.slug}`} />

        <aside
          className="mt-12 flex items-start gap-4 border-t border-border pt-8"
          itemProp="author"
          itemScope
          itemType="https://schema.org/Person"
        >
          <Image
            src={author.avatar}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
            itemProp="image"
          />
          <div className="min-w-0">
            <p className="text-base font-semibold text-foreground">
              <Link
                href={author.url}
                className="hover:text-accent"
                itemProp="url"
              >
                <span itemProp="name">{author.name}</span>
              </Link>
            </p>
            <p className="text-sm text-text-secondary" itemProp="jobTitle">
              {author.title}
            </p>
            <p
              className="mt-2 text-sm leading-6 text-text-secondary"
              itemProp="description"
            >
              {author.bio}
            </p>
            {socialHref ? (
              <p className="mt-2">
                <a
                  href={socialHref}
                  className="text-sm font-medium text-accent hover:text-accent-hover"
                  rel="noopener noreferrer"
                >
                  Follow {author.name} for Indian AI intelligence
                </a>
              </p>
            ) : null}
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mx-auto mt-12 w-full max-w-6xl px-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Related
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((article) => (
              <ArticleCard key={article.url} article={article} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
