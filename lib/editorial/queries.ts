import "server-only";

import { and, count, desc, eq, gte, ilike, inArray, ne, or } from "drizzle-orm";
import { auditLogs, editorialQueue, signals } from "@/drizzle/schema";
import type {
  EditorialAnalytics,
  ImpactLevel,
  IndiaRelevance,
  SignalAction,
  SignalCategory,
  SignalStatus,
} from "@/lib/editorial/types";
import { ACTION_TO_STATUS } from "@/lib/editorial/types";
import {
  calculateDeadline,
  calculatePriority,
} from "@/lib/editorial/priority";
import { getDb } from "@/lib/db";

export interface SignalFilters {
  status?: SignalStatus | SignalStatus[];
  category?: SignalCategory;
  impactLevel?: ImpactLevel;
  indiaRelevance?: IndiaRelevance;
  source?: string;
  assignedTo?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export async function listSignals(filters: SignalFilters = {}) {
  const db = getDb();
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (filters.status) {
    if (Array.isArray(filters.status)) {
      conditions.push(inArray(signals.status, filters.status));
    } else {
      conditions.push(eq(signals.status, filters.status));
    }
  }

  if (filters.category) conditions.push(eq(signals.category, filters.category));
  if (filters.impactLevel)
    conditions.push(eq(signals.impactLevel, filters.impactLevel));
  if (filters.indiaRelevance)
    conditions.push(eq(signals.indiaRelevance, filters.indiaRelevance));
  if (filters.source) conditions.push(eq(signals.source, filters.source));
  if (filters.assignedTo)
    conditions.push(eq(signals.assignedTo, filters.assignedTo));
  if (filters.q) {
    const q = `%${filters.q}%`;
    conditions.push(
      or(ilike(signals.title, q), ilike(signals.summary, q))!,
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(signals)
      .where(where)
      .orderBy(desc(signals.fetchedAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(signals).where(where),
  ]);

  return {
    items: rows,
    page,
    limit,
    total: totalRows[0]?.value ?? 0,
    totalPages: Math.ceil((totalRows[0]?.value ?? 0) / limit),
  };
}

export async function getSignalById(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(signals)
    .where(eq(signals.id, id))
    .limit(1);
  return row ?? null;
}

export async function getRelatedSignals(
  signalId: string,
  tags: string[],
  startups: string[],
  limit = 5,
) {
  const db = getDb();
  if (tags.length === 0 && startups.length === 0) return [];

  const rows = await db
    .select()
    .from(signals)
    .where(ne(signals.id, signalId))
    .orderBy(desc(signals.fetchedAt))
    .limit(40);

  return rows
    .map((row) => {
      const tagOverlap = row.tags.filter((t) => tags.includes(t)).length;
      const startupOverlap = row.relatedStartups.filter((s) =>
        startups.includes(s),
      ).length;
      return { row, score: tagOverlap * 2 + startupOverlap * 3 };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.row);
}

export async function applySignalAction(opts: {
  signalId: string;
  action: SignalAction;
  actorId: string;
  notes?: string;
  assignedTo?: string;
}) {
  const db = getDb();
  const signal = await getSignalById(opts.signalId);
  if (!signal) throw new Error("Signal not found");

  const nextStatus = ACTION_TO_STATUS[opts.action];
  const now = new Date();

  const [updated] = await db
    .update(signals)
    .set({
      status: nextStatus,
      notes: opts.notes ?? signal.notes,
      assignedTo: opts.assignedTo ?? signal.assignedTo,
      updatedAt: now,
    })
    .where(eq(signals.id, opts.signalId))
    .returning();

  if (opts.action === "approve" || opts.action === "start_draft") {
    await db
      .insert(editorialQueue)
      .values({
        signalId: opts.signalId,
        priority: calculatePriority(
          signal.impactLevel,
          signal.indiaRelevance,
        ),
        deadline: calculateDeadline(signal.impactLevel),
        notes: opts.notes ?? null,
      })
      .onConflictDoNothing({ target: editorialQueue.signalId });
  }

  await db.insert(auditLogs).values({
    signalId: opts.signalId,
    actorId: opts.actorId,
    action: opts.action,
    meta: { previousStatus: signal.status, nextStatus },
  });

  return updated;
}

export async function getEditorialAnalytics(): Promise<EditorialAnalytics> {
  const db = getDb();
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    todayRows,
    weekRows,
    monthRows,
    publishedRows,
    inboxRows,
    sourceRows,
    categoryRows,
    impactRows,
    publishedSignals,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(signals)
      .where(gte(signals.fetchedAt, startOfDay)),
    db
      .select({ value: count() })
      .from(signals)
      .where(gte(signals.fetchedAt, weekAgo)),
    db
      .select({ value: count() })
      .from(signals)
      .where(gte(signals.fetchedAt, monthAgo)),
    db
      .select({ value: count() })
      .from(signals)
      .where(eq(signals.status, "published")),
    db
      .select({ value: count() })
      .from(signals)
      .where(
        or(eq(signals.status, "new"), eq(signals.status, "reviewing"))!,
      ),
    db
      .select({
        source: signals.source,
        count: count(),
      })
      .from(signals)
      .groupBy(signals.source)
      .orderBy(desc(count()))
      .limit(10),
    db
      .select({
        category: signals.category,
        count: count(),
      })
      .from(signals)
      .groupBy(signals.category),
    db
      .select({
        impactLevel: signals.impactLevel,
        count: count(),
      })
      .from(signals)
      .groupBy(signals.impactLevel),
    db
      .select({
        fetchedAt: signals.fetchedAt,
        updatedAt: signals.updatedAt,
      })
      .from(signals)
      .where(eq(signals.status, "published"))
      .limit(200),
  ]);

  let avgHoursSignalToPublish: number | null = null;
  if (publishedSignals.length > 0) {
    const totalHours = publishedSignals.reduce((sum, row) => {
      return (
        sum +
        (row.updatedAt.getTime() - row.fetchedAt.getTime()) / 3_600_000
      );
    }, 0);
    avgHoursSignalToPublish = totalHours / publishedSignals.length;
  }

  return {
    signalsToday: todayRows[0]?.value ?? 0,
    signalsThisWeek: weekRows[0]?.value ?? 0,
    signalsThisMonth: monthRows[0]?.value ?? 0,
    publishedCount: publishedRows[0]?.value ?? 0,
    avgHoursSignalToPublish,
    topSources: sourceRows.map((r) => ({
      source: r.source,
      count: Number(r.count),
    })),
    categoryBreakdown: categoryRows.map((r) => ({
      category: r.category,
      count: Number(r.count),
    })),
    impactBreakdown: impactRows.map((r) => ({
      impactLevel: r.impactLevel,
      count: Number(r.count),
    })),
    inboxCount: inboxRows[0]?.value ?? 0,
  };
}
