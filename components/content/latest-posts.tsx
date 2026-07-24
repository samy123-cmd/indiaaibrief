"use client";

import { useState } from "react";
import { ArticleCard, type ArticleCardData } from "@/components/content/article-card";
import { Button } from "@/components/ui/button";

interface LatestPostsProps {
  initial: ArticleCardData[];
  more: ArticleCardData[];
}

/**
 * Latest posts with a single "Load more" reveal (no infinite scroll / no CLS cascade).
 * Both batches are preloaded from the Server Component.
 */
export function LatestPosts({ initial, more }: LatestPostsProps) {
  const [showMore, setShowMore] = useState(false);
  const articles = showMore ? [...initial, ...more] : initial;

  return (
    <div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, index) => (
          <ArticleCard
            key={article.url}
            article={article}
            priority={index === 0}
          />
        ))}
      </div>
      {!showMore && more.length > 0 ?
        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-11"
            onClick={() => setShowMore(true)}
          >
            Load more
          </Button>
        </div>
      : null}
    </div>
  );
}
