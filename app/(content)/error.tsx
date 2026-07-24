"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ContentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[content-route-error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col px-4 py-16">
      <p className="text-xs font-medium uppercase tracking-[0.05em] text-accent">
        Error
      </p>
      <h1 className="mt-3 text-[32px] font-extrabold tracking-[-0.02em] text-foreground">
        Something went wrong
      </h1>
      <p className="mt-3 text-text-secondary">
        We could not load this page. Try again, or return home.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button type="button" onClick={reset} size="lg">
          Retry
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">Go to homepage</Link>
        </Button>
      </div>
    </div>
  );
}
