import Link from "next/link";
import { IndiaPulseStrip } from "@/components/content/india-pulse-strip";
import { StartupTracker } from "@/components/trackers/startup-tracker";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { getAdvancedFiltersAccess } from "@/lib/auth";
import { INDIA_PULSE_HERO } from "@/lib/india-figures";
import {
  SEED_STARTUPS,
  uniqueStartupCities,
  uniqueStartupSectors,
  uniqueStartupStages,
} from "@/lib/seed-data";
import { breadcrumbSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Indian AI Startup Tracker",
  description:
    "Searchable profiles of Indian AI startups — city, sector, funding. Advanced filters unlock with Brief.",
  path: "/startups",
});

export default async function StartupsPage() {
  const { unlocked } = await getAdvancedFiltersAccess();
  const breadcrumbs = [
    { name: "Home", item: absoluteUrl("/") },
    { name: "Startup Tracker", item: absoluteUrl("/startups") },
  ];

  return (
    <div>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      <div className="mx-auto w-full max-w-6xl px-4 pt-12">
        <nav
          aria-label="Breadcrumb"
          className="text-xs font-medium uppercase tracking-[0.05em] text-text-secondary"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-accent">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-text-tertiary">Startup Tracker</li>
          </ol>
        </nav>

        <Badge className="mt-6">Database product</Badge>
        <h1 className="mt-3 text-[32px] font-extrabold tracking-[-0.02em] md:text-5xl">
          Startup Tracker
        </h1>
        <p className="mt-3 max-w-2xl text-text-secondary">
          Searchable, filterable database of Indian AI startups — logo, sector, city,
          last funding, and quick stats. Advanced stage and date filters unlock on
          Brief and Intelligence plans.
        </p>
      </div>

      <div className="mt-10">
        <IndiaPulseStrip
          stats={INDIA_PULSE_HERO}
          eyebrow="India AI Watch"
          title="Ecosystem context"
          variant="hero"
        />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <StartupTracker
          startups={SEED_STARTUPS}
          cities={uniqueStartupCities()}
          sectors={uniqueStartupSectors()}
          stages={uniqueStartupStages()}
          advancedUnlocked={unlocked}
        />

        <p className="mt-10 text-sm text-text-tertiary">
          Want alerts when a startup raises?{" "}
          <Link
            href="/subscribe"
            className="font-medium text-accent hover:text-accent-hover"
          >
            Join Brief founding list
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
