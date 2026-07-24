import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Author, ContentCategory } from "@/types";
import {
  categoryLabel,
  cn,
  formatArticleDate,
  readingTimeLabel,
} from "@/lib/utils";

export interface ArticleCardData {
  title: string;
  excerpt: string;
  url: string;
  category: ContentCategory;
  image: string;
  imageAlt: string;
  publishedAt: string;
  readingTime: number;
  author: Pick<Author, "name" | "avatar">;
}

interface ArticleCardProps {
  article: ArticleCardData;
  priority?: boolean;
  className?: string;
}

/**
 * Article card — Server Component.
 * Spec: 640×320 WebP thumb, lazy below-fold, 2-line clamps, category badge,
 * author meta, transform-only hover (no layout shift).
 */
export function ArticleCard({
  article,
  priority = false,
  className,
}: ArticleCardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-lg border border-border bg-surface transition-transform duration-200 hover:scale-[1.01] hover:shadow-[0_12px_30px_-18px_rgba(10,10,10,0.35)] dark:hover:shadow-[0_12px_30px_-18px_rgba(0,0,0,0.65)]",
        className,
      )}
    >
      <Link href={article.url} className="block focus-visible:outline-none">
        <div className="relative aspect-[640/320] w-full overflow-hidden bg-muted">
          <Image
            src={article.image}
            alt={article.imageAlt}
            width={640}
            height={320}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
            className="h-full w-full object-cover"
            loading={priority ? "eager" : "lazy"}
            priority={priority}
          />
        </div>

        <div className="space-y-3 p-4">
          <Badge
            variant="outline"
            className="border-transparent bg-transparent px-0 text-[12px] font-medium uppercase tracking-[0.05em] text-accent"
          >
            {categoryLabel(article.category)}
          </Badge>

          <h3 className="line-clamp-2 text-xl font-semibold leading-7 tracking-tight text-foreground group-hover:text-accent md:text-2xl md:leading-8">
            {article.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-6 text-text-secondary">
            {article.excerpt}
          </p>

          <div className="flex items-center gap-3 pt-1">
            <Image
              src={article.author.avatar}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
              loading="lazy"
            />
            <div className="min-w-0 text-xs leading-5 text-text-tertiary">
              <p className="truncate font-medium text-text-secondary">
                {article.author.name}
              </p>
              <p className="truncate">
                <time dateTime={article.publishedAt}>
                  {formatArticleDate(article.publishedAt)}
                </time>
                {" · "}
                {readingTimeLabel(article.readingTime)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
