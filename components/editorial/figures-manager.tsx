"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Figure } from "@/drizzle/schema";

interface FiguresManagerProps {
  initialFigures: Figure[];
}

export function FiguresManager({ initialFigures }: FiguresManagerProps) {
  const router = useRouter();
  const [figures, setFigures] = useState(initialFigures);
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Figure>>({});
  const [creating, setCreating] = useState(false);
  const [newFigure, setNewFigure] = useState({
    key: "",
    label: "",
    value: "",
    groupKey: "india_market_size",
    sourceName: "",
    sourceUrl: "",
    category: "market",
    sortOrder: "0",
  });
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    if (!q) return figures;
    return figures.filter(
      (f) =>
        f.key.includes(q) ||
        f.label.toLowerCase().includes(q) ||
        f.groupKey.includes(q) ||
        f.value.toLowerCase().includes(q),
    );
  }, [figures, filter]);

  const groups = useMemo(
    () => Array.from(new Set(figures.map((f) => f.groupKey))).sort(),
    [figures],
  );

  function startEdit(figure: Figure) {
    setEditingId(figure.id);
    setDraft({ ...figure });
    setMessage(null);
  }

  async function saveEdit() {
    if (!editingId) return;
    const res = await fetch(`/api/figures/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: draft.label,
        value: draft.value,
        unit: draft.unit,
        groupKey: draft.groupKey,
        category: draft.category,
        sourceName: draft.sourceName,
        sourceUrl: draft.sourceUrl || null,
        notes: draft.notes,
        sortOrder: draft.sortOrder,
        isActive: draft.isActive,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(JSON.stringify(data.error) || "Save failed");
      return;
    }
    setFigures((prev) =>
      prev.map((f) => (f.id === editingId ? data.item : f)),
    );
    setEditingId(null);
    setMessage("Figure updated — live pages revalidated");
    router.refresh();
  }

  async function createFigure(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/figures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: newFigure.key,
        label: newFigure.label,
        value: newFigure.value,
        groupKey: newFigure.groupKey,
        sourceName: newFigure.sourceName,
        sourceUrl: newFigure.sourceUrl || null,
        category: newFigure.category,
        sortOrder: Number(newFigure.sortOrder) || 0,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(JSON.stringify(data.error) || "Create failed");
      return;
    }
    setFigures((prev) => [...prev, data.item]);
    setCreating(false);
    setNewFigure({
      key: "",
      label: "",
      value: "",
      groupKey: "india_market_size",
      sourceName: "",
      sourceUrl: "",
      category: "market",
      sortOrder: "0",
    });
    setMessage(`Created ${data.item.key} — use <FigureTable group="${data.item.groupKey}" /> or <Figure id="${data.item.key}" />`);
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-sm"
          placeholder="Filter by key, label, group…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Button onClick={() => setCreating((v) => !v)}>
          {creating ? "Cancel" : "Add figure"}
        </Button>
      </div>

      {message ? (
        <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
          {message}
        </p>
      ) : null}

      <p className="text-sm text-text-secondary">
        In MDX:{" "}
        <code className="rounded bg-muted px-1 text-xs">
          {'<FigureTable group="india_investment" />'}
        </code>{" "}
        or{" "}
        <code className="rounded bg-muted px-1 text-xs">
          {'<Figure id="indiaai_mission_budget" />'}
        </code>
        . Groups: {groups.join(", ") || "none yet"}.
      </p>

      {creating ? (
        <form
          onSubmit={createFigure}
          className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-2"
        >
          <Input
            required
            placeholder="key (snake_case)"
            value={newFigure.key}
            onChange={(e) =>
              setNewFigure({ ...newFigure, key: e.target.value })
            }
          />
          <Input
            required
            placeholder="label"
            value={newFigure.label}
            onChange={(e) =>
              setNewFigure({ ...newFigure, label: e.target.value })
            }
          />
          <Input
            required
            placeholder="value"
            value={newFigure.value}
            onChange={(e) =>
              setNewFigure({ ...newFigure, value: e.target.value })
            }
          />
          <Input
            required
            placeholder="groupKey"
            value={newFigure.groupKey}
            onChange={(e) =>
              setNewFigure({ ...newFigure, groupKey: e.target.value })
            }
          />
          <Input
            required
            placeholder="source name"
            value={newFigure.sourceName}
            onChange={(e) =>
              setNewFigure({ ...newFigure, sourceName: e.target.value })
            }
          />
          <Input
            placeholder="source URL"
            value={newFigure.sourceUrl}
            onChange={(e) =>
              setNewFigure({ ...newFigure, sourceUrl: e.target.value })
            }
          />
          <Button type="submit" className="md:col-span-2 w-fit">
            Create
          </Button>
        </form>
      ) : null}

      <div className="space-y-3">
        {filtered.map((figure) => {
          const isEditing = editingId === figure.id;
          return (
            <article
              key={figure.id}
              className="rounded-lg border border-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{figure.key}</Badge>
                    <Badge variant="secondary">{figure.groupKey}</Badge>
                    {!figure.isActive ? (
                      <Badge variant="outline">inactive</Badge>
                    ) : null}
                  </div>
                  {isEditing ? (
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <Input
                        value={draft.label ?? ""}
                        onChange={(e) =>
                          setDraft({ ...draft, label: e.target.value })
                        }
                      />
                      <Input
                        value={draft.value ?? ""}
                        onChange={(e) =>
                          setDraft({ ...draft, value: e.target.value })
                        }
                      />
                      <Input
                        value={draft.sourceName ?? ""}
                        onChange={(e) =>
                          setDraft({ ...draft, sourceName: e.target.value })
                        }
                      />
                      <Input
                        value={draft.groupKey ?? ""}
                        onChange={(e) =>
                          setDraft({ ...draft, groupKey: e.target.value })
                        }
                      />
                      <Input
                        value={draft.sourceUrl ?? ""}
                        onChange={(e) =>
                          setDraft({ ...draft, sourceUrl: e.target.value })
                        }
                        placeholder="source URL"
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={draft.isActive ?? true}
                          onChange={(e) =>
                            setDraft({ ...draft, isActive: e.target.checked })
                          }
                        />
                        Active
                      </label>
                    </div>
                  ) : (
                    <>
                      <h3 className="mt-2 font-semibold">{figure.label}</h3>
                      <p className="mt-1 font-mono text-lg font-bold">
                        {figure.value}
                        {figure.unit ? ` ${figure.unit}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {figure.sourceName}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={saveEdit}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startEdit(figure)}>
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
