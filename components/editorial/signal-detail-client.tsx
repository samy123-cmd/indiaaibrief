"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatRelative,
  impactColorClass,
} from "@/components/editorial/utils";
import { getIndiaHighlightTerms } from "@/lib/editorial/classify-client";
import { cn } from "@/lib/utils";
import type { Signal } from "@/drizzle/schema";

interface SignalDetailClientProps {
  signal: Signal;
  related: Signal[];
}

function highlightIndiaTerms(text: string): ReactNode[] {
  const terms = getIndiaHighlightTerms().sort((a, b) => b.length - a.length);
  if (!text) return [text];

  const pattern = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );

  const parts = text.split(pattern);
  return parts.map((part, i) => {
    const match = terms.some(
      (t) => t.toLowerCase() === part.toLowerCase(),
    );
    if (match) {
      return (
        <mark
          key={`${part}-${i}`}
          className="rounded bg-accent/20 px-0.5 text-foreground"
        >
          {part}
        </mark>
      );
    }
    return <span key={`${part}-${i}`}>{part}</span>;
  });
}

export function SignalDetailClient({
  signal: initial,
  related,
}: SignalDetailClientProps) {
  const router = useRouter();
  const [signal, setSignal] = useState(initial);
  const [draft, setDraft] = useState(initial.aiDraft ?? "");
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [title, setTitle] = useState(initial.title.slice(0, 60));
  const [description, setDescription] = useState(
    (initial.summary || "").slice(0, 160),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const checklistPreview = useMemo(() => {
    return {
      titleLen: title.length,
      descLen: description.length,
      hasDraft: draft.length > 40,
      hasIndia: /what this means for indian/i.test(draft),
      hasSource: draft.includes(signal.sourceUrl),
    };
  }, [title, description, draft, signal.sourceUrl]);

  async function runAction(action: string) {
    setMessage(null);
    const res = await fetch(`/api/signals/${signal.id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Action failed");
      return;
    }
    setSignal(data.signal);
    setMessage(`Status → ${data.signal.status}`);
    startTransition(() => router.refresh());
  }

  async function generateDraft() {
    setMessage(null);
    const res = await fetch(`/api/signals/${signal.id}/draft`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Draft generation failed");
      return;
    }
    setDraft(data.draft);
    setSignal(data.signal);
    setMessage("AI draft generated");
  }

  async function publish() {
    setMessage(null);
    const res = await fetch(`/api/signals/${signal.id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        body: draft,
        tags: signal.tags.length ? signal.tags : [signal.category],
        author: "indiaaibrief-desk",
        image: "/images/articles/placeholder.svg",
        imageAlt: title,
        category: "news",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(
        data.checklist?.errors?.join("; ") ??
          data.error ??
          "Publish failed",
      );
      return;
    }
    setMessage(`Published: ${data.published.url}`);
    startTransition(() => router.refresh());
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-tertiary">
            {signal.source} · {signal.status}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
            {signal.title}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={cn(
                "inline-flex rounded border px-2 py-0.5 text-xs font-semibold uppercase",
                impactColorClass(signal.impactLevel),
              )}
            >
              {signal.impactLevel}
            </span>
            <span className="rounded border border-border px-2 py-0.5 text-xs">
              {signal.indiaRelevance}
            </span>
            <span className="rounded border border-border px-2 py-0.5 text-xs">
              {signal.category}
            </span>
            <span className="text-xs text-text-tertiary">
              {formatRelative(signal.fetchedAt)}
            </span>
          </div>
        </div>
        <a
          href={signal.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-accent hover:underline"
        >
          Open source ↗
        </a>
      </div>

      {message ? (
        <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
          {message}
        </p>
      ) : null}

      <section className="rounded-lg border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
          Summary / raw content
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          {highlightIndiaTerms(signal.summary || signal.rawContent)}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-text-tertiary">
            Title ({title.length}/60)
          </label>
          <Input
            className="mt-2"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 60))}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-text-tertiary">
            Description ({description.length}/160)
          </label>
          <Input
            className="mt-2"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 160))}
          />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
            AI draft
          </h2>
          <Button size="sm" onClick={generateDraft} disabled={pending}>
            Generate Draft
          </Button>
        </div>
        <textarea
          className="mt-3 min-h-[320px] w-full rounded-md border border-border bg-background p-3 font-mono text-sm"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Generate or paste MDX draft…"
        />
        <ul className="mt-3 grid gap-1 text-xs text-text-secondary sm:grid-cols-2">
          <li>Title length OK: {checklistPreview.titleLen <= 60 ? "yes" : "no"}</li>
          <li>Description OK: {checklistPreview.descLen <= 160 ? "yes" : "no"}</li>
          <li>Draft body: {checklistPreview.hasDraft ? "yes" : "no"}</li>
          <li>India angle: {checklistPreview.hasIndia ? "yes" : "no"}</li>
          <li>Source attribution: {checklistPreview.hasSource ? "yes" : "no"}</li>
        </ul>
      </section>

      <section>
        <label className="text-xs font-semibold uppercase text-text-tertiary">
          Editor notes
        </label>
        <textarea
          className="mt-2 min-h-24 w-full rounded-md border border-border bg-background p-3 text-sm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </section>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => runAction("review")}>
          Review
        </Button>
        <Button variant="outline" onClick={() => runAction("approve")}>
          Approve
        </Button>
        <Button variant="destructive" onClick={() => runAction("reject")}>
          Reject
        </Button>
        <Button onClick={publish} disabled={pending}>
          Publish
        </Button>
        <Button variant="secondary" onClick={() => runAction("archive")}>
          Archive
        </Button>
      </div>

      {related.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
            Related signals
          </h2>
          <ul className="mt-3 space-y-2">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/dashboard/editorial/${r.id}`}
                  className="text-sm text-accent hover:underline"
                >
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
