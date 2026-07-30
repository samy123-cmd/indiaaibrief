import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Page Not Found",
  description: "The page you requested could not be found on IndiaAIBrief.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col px-4 py-16">
      <p className="text-xs font-medium uppercase tracking-[0.05em] text-accent">
        404
      </p>
      <h1 className="mt-3 text-[32px] font-extrabold tracking-[-0.02em] text-foreground md:text-5xl">
        Page not found
      </h1>
      <p className="mt-3 text-text-secondary">
        That URL does not exist — or it moved. Search the library, or jump to a
        category.
      </p>

      <form
        action="/search"
        method="get"
        className="mt-8 flex flex-col gap-2 sm:flex-row"
      >
        <Input
          type="search"
          name="q"
          placeholder="Search IndiaAIBrief…"
          aria-label="Search"
          className="flex-1"
          minLength={2}
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <ul className="mt-8 grid gap-2 text-sm sm:grid-cols-2">
        {[
          { href: "/", label: "Homepage" },
          { href: "/news", label: "Latest news" },
          { href: "/explains", label: "Explainers" },
          { href: "/playbooks", label: "Playbooks" },
          { href: "/startups", label: "Startup tracker" },
          { href: "/kit/ai-compliance", label: "Compliance kit" },
        ].map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="font-medium text-accent hover:text-accent-hover"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <Button asChild size="lg" className="mt-10 w-full sm:w-auto">
        <Link href="/">Return to home</Link>
      </Button>
    </div>
  );
}
