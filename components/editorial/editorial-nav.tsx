"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard/editorial", label: "Inbox" },
  { href: "/dashboard/editorial/articles", label: "Articles" },
  { href: "/dashboard/editorial/figures", label: "Figures" },
  { href: "/dashboard/editorial/sources", label: "Sources" },
  { href: "/dashboard/editorial/analytics", label: "Analytics" },
];

export function EditorialNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-3">
      {LINKS.map((link) => {
        const active =
          link.href === "/dashboard/editorial"
            ? pathname === link.href
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium",
              active
                ? "bg-accent text-primary-foreground"
                : "bg-muted text-text-secondary hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
