import Link from "next/link";
import { Search } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth";
import { PRIMARY_NAV } from "@/lib/navigation";

/**
 * Site navigation — Server Component.
 * Interactive pieces: ThemeToggle + MobileNav (Sheet) only.
 */
export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-surface/80 backdrop-blur-md md:h-16">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center gap-2 px-4">
        <Link
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center"
          aria-label="IndiaAIBrief home"
        >
          <BrandMark size={28} priority />
        </Link>

        <nav
          className="mx-auto hidden items-center justify-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-text-secondary transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/search"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>

          <ThemeToggle />

          {user ? (
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/dashboard">Account</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}

          <Button asChild className="hidden sm:inline-flex">
            <Link href="/subscribe">Subscribe</Link>
          </Button>

          <MobileNav items={PRIMARY_NAV} signedIn={Boolean(user)} />
        </div>
      </div>
    </header>
  );
}
