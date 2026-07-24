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
      <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">
        IndiaAIBrief is written by people who verify claims against primary
        sources — MeitY documents, company filings, court orders, and production
        systems — not by recycling aggregator headlines. Every byline is
        accountable for India-specific context founders and CTOs can act on.
      </p>

      <section className="prose-article mt-8 max-w-3xl !px-0 !py-0">
        <h2 className="!mt-0 text-xl font-semibold text-foreground">
          How our desk works
        </h2>
        <p className="text-base leading-7 text-text-secondary">
          AI may draft outlines; humans fact-check funding amounts, policy
          references, and quotes before publish. We refuse pay-for-play coverage
          and label sponsored briefs when they appear. Authors disclose conflicts
          on their profiles and on articles when relevant. If you spot an error,
          email the desk with the URL and evidence — material corrections land
          within 48 hours with a visible note.
        </p>
        <p className="text-base leading-7 text-text-secondary">
          Browse explainers, news, and playbooks from each author below, or read
          our{" "}
          <Link href="/editorial" className="text-accent hover:text-accent-hover">
            editorial policy
          </Link>{" "}
          and{" "}
          <Link href="/about" className="text-accent hover:text-accent-hover">
            about page
          </Link>{" "}
          for standards and mission.
        </p>
      </section>

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
