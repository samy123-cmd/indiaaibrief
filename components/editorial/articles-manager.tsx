"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { DbArticle } from "@/drizzle/schema";
import type { Post } from "@/types";

interface ArticlesManagerProps {
  dbArticles: DbArticle[];
  mdxArticles: Array<Pick<Post, "slug" | "title" | "category" | "url" | "publishedAt">>;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "news",
  slug: "",
  author: "indiaaibrief-desk",
  tags: "india,ai",
  image: "/images/articles/placeholder.svg",
  imageAlt: "Article cover",
  bodyMdx: `<Answer>
Direct answer in 40–60 words.
</Answer>

## What Changed

- Point one

## The Details

Details with source links.

| Metric | Finding |
| :--- | :--- |
| Example | Value |

## What This Means for Indian Founders and CTOs

- Actionable takeaway

## Frequently Asked Questions

### Question?

Answer.
`,
  status: "draft",
};

export function ArticlesManager({
  dbArticles,
  mdxArticles,
}: ArticlesManagerProps) {
  const router = useRouter();
  const [articles, setArticles] = useState(dbArticles);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const filteredDb = useMemo(() => {
    const query = q.toLowerCase();
    if (!query) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.slug.includes(query) ||
        a.category.includes(query),
    );
  }, [articles, q]);

  function loadForEdit(article: DbArticle) {
    setEditingId(article.id);
    setCreating(true);
    setForm({
      title: article.title,
      description: article.description,
      category: article.category,
      slug: article.slug,
      author: article.author,
      tags: article.tags.join(","),
      image: article.image,
      imageAlt: article.imageAlt,
      bodyMdx: article.bodyMdx,
      status: article.status,
    });
    setMessage(null);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      slug: form.slug || undefined,
      author: form.author,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      image: form.image,
      imageAlt: form.imageAlt,
      bodyMdx: form.bodyMdx,
      status: form.status,
    };

    const res = await fetch(
      editingId ? `/api/articles/${editingId}` : "/api/articles",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      setMessage(JSON.stringify(data.error) || "Save failed");
      return;
    }

    if (editingId) {
      setArticles((prev) =>
        prev.map((a) => (a.id === editingId ? data.item : a)),
      );
    } else {
      setArticles((prev) => [data.item, ...prev]);
    }

    setMessage(
      `Saved. ${data.url ? `Public URL: ${data.url}` : ""} Use markdown tables or <FigureTable group="…" />.`,
    );
    setCreating(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap gap-3">
        <Input
          className="max-w-sm"
          placeholder="Search DB articles…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button
          onClick={() => {
            setCreating((v) => !v);
            setEditingId(null);
            setForm(EMPTY_FORM);
          }}
        >
          {creating && !editingId ? "Cancel" : "New article"}
        </Button>
      </div>

      {message ? (
        <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
          {message}
        </p>
      ) : null}

      {creating ? (
        <form
          onSubmit={save}
          className="space-y-3 rounded-lg border border-border bg-surface p-4"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
            {editingId ? "Edit article" : "Create article"}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              required
              maxLength={60}
              placeholder="Title (≤60)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              required
              maxLength={160}
              placeholder="Description (≤160)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {["news", "explains", "compares", "playbooks", "data"].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ),
              )}
            </Select>
            <Input
              placeholder="slug (optional)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <Input
              placeholder="tags (comma-separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </Select>
            <Input
              placeholder="image path"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
            <Input
              placeholder="image alt"
              value={form.imageAlt}
              onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
            />
          </div>
          <textarea
            required
            className="min-h-[360px] w-full rounded-md border border-border bg-background p-3 font-mono text-sm"
            value={form.bodyMdx}
            onChange={(e) => setForm({ ...form, bodyMdx: e.target.value })}
          />
          <Button type="submit">{editingId ? "Update" : "Create"}</Button>
        </form>
      ) : null}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
          Editable (Supabase)
        </h2>
        <div className="mt-3 space-y-2">
          {filteredDb.map((article) => (
            <div
              key={article.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-4 py-3"
            >
              <div>
                <p className="font-medium">{article.title}</p>
                <p className="text-xs text-text-tertiary">
                  /{article.category}/{article.slug}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{article.status}</Badge>
                {article.status === "published" ? (
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/${article.category}/${article.slug}`}>
                      View
                    </Link>
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadForEdit(article)}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
          {filteredDb.length === 0 ? (
            <p className="text-sm text-text-secondary">
              No Supabase articles yet. Create one above (or publish from a
              signal).
            </p>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
          Filesystem MDX ({mdxArticles.length})
        </h2>
        <p className="mt-1 text-xs text-text-tertiary">
          Git-managed content. To edit live on Vercel, recreate as a Supabase
          article with the same category/slug (DB wins).
        </p>
        <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
          {mdxArticles.slice(0, 40).map((post) => (
            <div
              key={`${post.category}-${post.slug}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-border px-3 py-2 text-sm"
            >
              <span>
                {post.title}{" "}
                <span className="text-text-tertiary">({post.category})</span>
              </span>
              <Button asChild size="sm" variant="ghost">
                <Link href={post.url}>View</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
