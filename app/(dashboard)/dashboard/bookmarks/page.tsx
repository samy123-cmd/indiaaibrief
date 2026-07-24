import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Bookmarks",
  description: "Saved articles on IndiaAIBrief.",
  path: "/dashboard/bookmarks",
  noIndex: true,
});

export default function BookmarksPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="text-[32px] font-extrabold tracking-[-0.02em]">Bookmarks</h1>
      <p className="mt-3 text-base leading-7 text-text-secondary">
        Your saved articles will live here. The library unlocks with Brief — join
        the founding list so you are first when save-for-later ships.
      </p>
      <div className="mt-8 rounded-lg border border-dashed border-border bg-surface p-8 text-center">
        <p className="text-sm text-text-secondary">No bookmarks yet.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/subscribe">Join Brief founding list</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/explains">Browse explainers</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
