"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[article-route-error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col px-4 py-16">
      <h1 className="text-[32px] font-extrabold tracking-[-0.02em] text-foreground">
        Something went wrong
      </h1>
      <p className="mt-3 text-text-secondary">
        This article failed to load. Retry or browse the latest news.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button type="button" onClick={reset}>
          Retry
        </Button>
        <Button asChild variant="outline">
          <Link href="/news">Latest news</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Homepage</Link>
        </Button>
      </div>
    </div>
  );
}
