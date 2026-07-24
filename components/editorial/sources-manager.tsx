"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRelative } from "@/components/editorial/utils";
import type { Source } from "@/drizzle/schema";

interface SourcesManagerProps {
  initialSources: Source[];
}

export function SourcesManager({ initialSources }: SourcesManagerProps) {
  const router = useRouter();
  const [sources, setSources] = useState(initialSources);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    url: "",
    type: "rss",
    category: "funding",
    fetchFrequency: "1hour",
    config: '{"feedUrl":""}',
  });

  async function toggleActive(source: Source) {
    const res = await fetch(`/api/sources/${source.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !source.isActive }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Update failed");
      return;
    }
    setSources((prev) =>
      prev.map((s) => (s.id === source.id ? data.item : s)),
    );
    router.refresh();
  }

  async function testSource(id: string) {
    setPreview("Testing…");
    const res = await fetch(`/api/sources/${id}/test`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setPreview(data.error ?? "Test failed");
      return;
    }
    setPreview(JSON.stringify(data.preview, null, 2));
  }

  async function createSource(e: FormEvent) {
    e.preventDefault();
    let config: Record<string, unknown> = {};
    try {
      config = JSON.parse(form.config || "{}") as Record<string, unknown>;
    } catch {
      alert("Config must be valid JSON");
      return;
    }

    const res = await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        url: form.url,
        type: form.type,
        category: form.category,
        fetchFrequency: form.fetchFrequency,
        config,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(JSON.stringify(data.error) || "Create failed");
      return;
    }
    setSources((prev) => [data.item, ...prev]);
    setForm({
      name: "",
      url: "",
      type: "rss",
      category: "funding",
      fetchFrequency: "1hour",
      config: '{"feedUrl":""}',
    });
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-8">
      <form
        onSubmit={createSource}
        className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-2"
      >
        <h2 className="md:col-span-2 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
          Add source
        </h2>
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          placeholder="URL"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          required
        />
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          {["rss", "scrape", "api", "webhook", "manual"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={form.fetchFrequency}
          onChange={(e) =>
            setForm({ ...form, fetchFrequency: e.target.value })
          }
        >
          {["5min", "15min", "1hour", "6hours", "daily"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <textarea
          className="min-h-24 rounded-md border border-border bg-background p-3 font-mono text-xs md:col-span-2"
          value={form.config}
          onChange={(e) => setForm({ ...form, config: e.target.value })}
        />
        <Button type="submit" className="md:col-span-2 w-fit">
          Create source
        </Button>
      </form>

      {preview ? (
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-3 text-xs">
          {preview}
        </pre>
      ) : null}

      <div className="space-y-3">
        {sources.map((source) => (
          <article
            key={source.id}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{source.name}</h3>
                <p className="mt-1 break-all text-xs text-text-secondary">
                  {source.url}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">{source.type}</Badge>
                  <Badge variant="outline">{source.fetchFrequency}</Badge>
                  <Badge variant={source.isActive ? "success" : "secondary"}>
                    {source.isActive ? "active" : "inactive"}
                  </Badge>
                  {source.lastFetchStatus ? (
                    <Badge variant="outline">{source.lastFetchStatus}</Badge>
                  ) : null}
                </div>
                {source.lastFetchedAt ? (
                  <p className="mt-2 text-xs text-text-tertiary">
                    Last fetch {formatRelative(source.lastFetchedAt)}
                  </p>
                ) : null}
                {source.lastFetchError ? (
                  <p className="mt-1 text-xs text-red-600">
                    {source.lastFetchError}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testSource(source.id)}
                >
                  Test
                </Button>
                <Button size="sm" onClick={() => toggleActive(source)}>
                  {source.isActive ? "Disable" : "Enable"}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
