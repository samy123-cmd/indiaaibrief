"use client";

import { useState } from "react";
import Link from "next/link";
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
        className="flex min-h-11 w-full items-center justify-between py-3 text-left text-xs font-medium uppercase tracking-[0.05em] text-text-tertiary md:pointer-events-none md:cursor-default md:py-0"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {title}
        <span className="text-base text-text-secondary md:hidden" aria-hidden>
          {open ? "−" : "+"}
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
              className="inline-flex min-h-11 items-center text-sm text-text-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
