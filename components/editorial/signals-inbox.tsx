"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatRelative,
  impactColorClass,
} from "@/components/editorial/utils";
import { cn } from "@/lib/utils";
import type { Signal } from "@/drizzle/schema";

interface SignalsInboxProps {
  initialSignals: Signal[];
  total: number;
}

export function SignalsInbox({ initialSignals, total }: SignalsInboxProps) {
  const router = useRouter();
  const [signals, setSignals] = useState(initialSignals);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [impact, setImpact] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return signals.filter((s) => {
      if (category && s.category !== category) return false;
      if (impact && s.impactLevel !== impact) return false;
      if (q) {
        const hay = `${s.title} ${s.summary}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [signals, category, impact, q]);

  async function runAction(id: string, action: string) {
    const res = await fetch(`/api/signals/${id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Action failed");
      return;
    }
    const data = (await res.json()) as { signal: Signal };
    setSignals((prev) =>
      prev.map((s) => (s.id === id ? data.signal : s)).filter((s) => {
        if (action === "reject" || action === "archive") return s.id !== id;
        if (action === "approve" || action === "review" || action === "start_draft")
          return s.status === "new" || s.status === "reviewing" || s.id === id;
        return true;
      }),
    );
    startTransition(() => router.refresh());
  }

  async function bulkAction(action: "approve" | "reject") {
    const ids = Array.from(selected);
    for (const id of ids) {
      await runAction(id, action);
    }
    setSelected(new Set());
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Search
          </label>
          <Input
            className="mt-2"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Title or summary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Category
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {[
              "policy",
              "funding",
              "product_launch",
              "research",
              "acquisition",
              "partnership",
              "regulation",
              "controversy",
              "opportunity",
            ].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Impact
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={impact}
            onChange={(e) => setImpact(e.target.value)}
          >
            <option value="">All</option>
            {["critical", "high", "medium", "low"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-text-tertiary">
          Showing {filtered.length} of {total} inbox signals
        </p>
      </aside>

      <div className="space-y-3">
        {selected.size > 0 ? (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={pending}
              onClick={() => bulkAction("approve")}
            >
              Bulk approve ({selected.size})
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={pending}
              onClick={() => bulkAction("reject")}
            >
              Bulk reject
            </Button>
          </div>
        ) : null}

        <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-text-tertiary">
              <tr>
                <th className="px-3 py-3">
                  <span className="sr-only">Select</span>
                </th>
                <th className="px-3 py-3">Title</th>
                <th className="px-3 py-3">Source</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Impact</th>
                <th className="px-3 py-3">India</th>
                <th className="px-3 py-3">Fetched</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((signal) => (
                <tr
                  key={signal.id}
                  className="border-b border-border align-top last:border-0"
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(signal.id)}
                      onChange={() => toggle(signal.id)}
                      className="size-4"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/dashboard/editorial/${signal.id}`}
                      className="font-medium text-foreground hover:text-accent"
                    >
                      {signal.title}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {signal.source}
                  </td>
                  <td className="px-3 py-3">{signal.category}</td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded border px-2 py-0.5 text-xs font-semibold uppercase",
                        impactColorClass(signal.impactLevel),
                      )}
                    >
                      {signal.impactLevel}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {signal.indiaRelevance}
                  </td>
                  <td className="px-3 py-3 text-text-tertiary">
                    {formatRelative(signal.fetchedAt)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runAction(signal.id, "approve")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => runAction(signal.id, "reject")}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => runAction(signal.id, "start_draft")}
                      >
                        Draft
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 md:hidden">
          {filtered.map((signal) => (
            <article
              key={signal.id}
              className="rounded-lg border border-border bg-surface p-4"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(signal.id)}
                  onChange={() => toggle(signal.id)}
                  className="mt-1 size-4"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/editorial/${signal.id}`}
                    className="font-semibold leading-snug"
                  >
                    {signal.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">{signal.source}</Badge>
                    <span
                      className={cn(
                        "inline-flex rounded border px-2 py-0.5 text-xs font-semibold uppercase",
                        impactColorClass(signal.impactLevel),
                      )}
                    >
                      {signal.impactLevel}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runAction(signal.id, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => runAction(signal.id, "reject")}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => runAction(signal.id, "start_draft")}
                    >
                      Draft
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-text-secondary">
            No signals match your filters.
          </p>
        ) : null}
      </div>
    </div>
  );
}
