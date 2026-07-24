import Link from "next/link";
import Image from "next/image";
import { getAllAuthors } from "@/lib/authors";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Authors — Editorial Team",
  description:
    "Meet the IndiaAIBrief editorial team covering Indian AI policy, startups, and decision-ready intelligence.",
  path: "/authors",
});

export default function AuthorsIndexPage() {
  const authors = getAllAuthors();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-[32px] font-extrabold tracking-[-0.02em] text-foreground md:text-5xl">
        Authors
      </h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        India-first AI intelligence from editors who verify every claim against
        primary sources.
      </p>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((author) => (
          <li key={author.slug}>
            <Link
              href={`/authors/${author.slug}`}
              className="flex gap-4 rounded-lg border border-border bg-surface p-4 transition-transform hover:scale-[1.01]"
            >
              <Image
                src={author.avatar}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover object-top"
              />
              <div>
                <p className="font-semibold text-foreground">{author.name}</p>
                <p className="text-sm text-accent">{author.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                  {author.bio}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
