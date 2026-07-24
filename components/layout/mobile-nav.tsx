"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NavItem } from "@/types";

interface MobileNavProps {
  items: NavItem[];
}

/** Client-only: hamburger → full-screen Sheet overlay. */
export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full max-w-none flex-col border-0 bg-surface p-0 sm:max-w-none"
      >
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="text-left">
            <BrandMark size={24} />
          </SheetTitle>
        </SheetHeader>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6"
          aria-label="Mobile"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 w-full items-center rounded-md px-3 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/newsletter"
            className="inline-flex min-h-11 w-full items-center rounded-md px-3 text-base font-medium text-foreground hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Newsletter
          </Link>
          <Link
            href="/about"
            className="inline-flex min-h-11 w-full items-center rounded-md px-3 text-base font-medium text-foreground hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            About
          </Link>
        </nav>

        <div className="mt-auto space-y-2 border-t border-border p-4">
          <Link
            href="/subscribe"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-primary-foreground hover:bg-accent-hover"
            onClick={() => setOpen(false)}
          >
            Subscribe
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Account
          </Link>
          <Link
            href="/search"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Search
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
