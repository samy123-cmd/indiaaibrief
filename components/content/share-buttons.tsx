"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  title: string;
  url: string;
  className?: string;
}

function toAbsolute(url: string): string {
  if (url.startsWith("http")) return url;
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://indiaaibrief.com";
  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
}

function shareText(title: string, absolute: string): string {
  return `${title} ${absolute} #IndiaAI`;
}

export function ShareButtons({ title, url, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const absolute = typeof window !== "undefined" ? toAbsolute(url) : url;
  const encodedUrl = encodeURIComponent(
    typeof window !== "undefined" ? absolute : `https://indiaaibrief.com${url.startsWith("/") ? url : `/${url}`}`,
  );
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(
    shareText(
      title,
      typeof window !== "undefined"
        ? absolute
        : `https://indiaaibrief.com${url.startsWith("/") ? url : `/${url}`}`,
    ),
  );

  const nativeShare = useCallback(async () => {
    const abs = toAbsolute(url);
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          url: abs,
          text: shareText(title, abs),
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(abs);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [title, url]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(toAbsolute(url));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [url]);

  const fallbackLinks = [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedText}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}`,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
  ];

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={nativeShare}
        className="min-h-11"
      >
        Share
      </Button>
      {fallbackLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-md border border-border px-3 text-sm font-medium text-text-secondary hover:border-accent hover:text-foreground"
        >
          {link.label}
        </a>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={copyLink}
        className="min-h-11"
      >
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}
