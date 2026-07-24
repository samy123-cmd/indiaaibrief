"use client";

import { useEffect, useState } from "react";
import { NewsletterCTA } from "@/components/content/newsletter-cta";

interface ArticleNewsletterSlotProps {
  source?: string;
}

/**
 * Reveals an inline newsletter CTA after the reader scrolls past ~50% of the page.
 * Sticky mobile CTA remains in the root layout.
 */
export function ArticleNewsletterSlot({
  source = "article-inline",
}: ArticleNewsletterSlotProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        setVisible(true);
        return;
      }
      const progress = window.scrollY / scrollable;
      if (progress >= 0.5) {
        setVisible(true);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) {
    return <div aria-hidden className="h-0 w-full" />;
  }

  return (
    <div className="mt-10">
      <NewsletterCTA
        variant="inline"
        source={source}
        title="Get The Brief"
        description="Weekly Indian AI intelligence — answer-first, India-first. Free."
      />
    </div>
  );
}
