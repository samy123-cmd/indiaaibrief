"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { NewsletterForm } from "@/components/content/newsletter-form";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "iab_newsletter_sticky_dismissed";

interface NewsletterStickyBarProps {
  source: string;
  title: string;
  description: string;
}

/**
 * Sticky bottom newsletter bar — mobile-first.
 * Client-only for dismiss state; form is shared NewsletterForm.
 */
export function NewsletterStickyBar({
  source,
  title,
  description,
}: NewsletterStickyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // sessionStorage may be unavailable
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 p-3 backdrop-blur-md md:hidden"
      role="region"
      aria-label="Newsletter signup"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="line-clamp-2 text-xs leading-5 text-text-secondary">
              {description}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Dismiss newsletter signup"
            onClick={dismiss}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <NewsletterForm source={source} />
      </div>
    </div>
  );
}
