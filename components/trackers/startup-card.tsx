import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Startup } from "@/types";
import { formatArticleDate } from "@/lib/utils";

interface StartupCardProps {
  startup: Startup;
}

export function StartupCard({ startup }: StartupCardProps) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      <Link href={`/startups/${startup.slug}`} className="group flex flex-1 flex-col gap-4">
        <div className="flex items-start gap-3">
          <Image
            src={startup.logo}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold tracking-tight text-foreground group-hover:text-accent">
              {startup.name}
            </h3>
            <p className="text-sm text-text-secondary">
              {startup.city} · {startup.sector}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 uppercase tracking-[0.04em]">
            {startup.stage}
          </Badge>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-text-secondary">
          {startup.summary}
        </p>

        <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-border pt-3 font-mono text-xs leading-5 text-text-secondary">
          <div>
            <dt className="uppercase tracking-[0.05em] text-text-tertiary">
              Last funding
            </dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {startup.lastFunding}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.05em] text-text-tertiary">Date</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {formatArticleDate(startup.lastFundingDate)}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.05em] text-text-tertiary">Team</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {startup.employees}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.05em] text-text-tertiary">
              Founded
            </dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {startup.foundedYear}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          {startup.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-2 py-1 text-[11px] uppercase tracking-[0.04em] text-text-tertiary"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>

      <div className="flex flex-wrap gap-3 border-t border-border pt-3 text-sm">
        <Link
          href={`/startups/${startup.slug}`}
          className="font-medium text-accent hover:text-accent-hover"
        >
          Profile →
        </Link>
        <a
          href={startup.website}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-text-secondary hover:text-foreground"
        >
          Website
        </a>
      </div>
    </article>
  );
}
