"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const NewsletterStickyBar = dynamic(
  () =>
    import("@/components/content/newsletter-sticky-bar").then(
      (mod) => mod.NewsletterStickyBar,
    ),
  { ssr: false },
);

interface NewsletterStickyLoaderProps {
  source: string;
  title: string;
  description: string;
}

/**
 * Defer sticky newsletter JS until the browser is idle so it does not compete
 * with LCP / main-thread work on first paint.
 */
export function NewsletterStickyLoader(props: NewsletterStickyLoaderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setReady(true);
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(enable, { timeout: 2500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const timer = window.setTimeout(enable, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  if (!ready) return null;
  return <NewsletterStickyBar {...props} />;
}
