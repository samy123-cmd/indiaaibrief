"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "@/types";
import { cn } from "@/lib/utils";

interface FooterAccordionColumnProps {
  title: string;
  links: NavItem[];
  defaultOpen?: boolean;
}

export function FooterAccordionColumn({
  title,
  links,
  defaultOpen = false,
}: FooterAccordionColumnProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border md:border-b-0">
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between gap-3 py-3 text-left text-sm font-semibold uppercase tracking-[0.06em] text-foreground md:pointer-events-none md:cursor-default md:py-0 md:text-xs md:font-medium md:tracking-[0.05em] md:text-text-secondary"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {title}
        <span
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-foreground md:hidden",
            open && "bg-accent/10 text-accent",
          )}
          aria-hidden
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </span>
      </button>
      <ul
        className={cn(
          "space-y-1 pb-4 md:mt-3 md:pb-0",
          open ? "block" : "hidden md:block",
        )}
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-11 items-center text-sm font-medium text-text-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
