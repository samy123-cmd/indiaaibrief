import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";
import { figures, type Figure, type NewFigure } from "@/drizzle/schema";
import { getDb } from "@/lib/db";

export async function getFigureByKey(key: string): Promise<Figure | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(figures)
      .where(and(eq(figures.key, key), eq(figures.isActive, true)))
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

export async function getFiguresByKeys(keys: string[]): Promise<Figure[]> {
  if (!process.env.DATABASE_URL || keys.length === 0) return [];
  try {
    const db = getDb();
    return await db
      .select()
      .from(figures)
      .where(and(inArray(figures.key, keys), eq(figures.isActive, true)))
      .orderBy(asc(figures.sortOrder));
  } catch {
    return [];
  }
}

export async function getFiguresByGroup(groupKey: string): Promise<Figure[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const db = getDb();
    return await db
      .select()
      .from(figures)
      .where(and(eq(figures.groupKey, groupKey), eq(figures.isActive, true)))
      .orderBy(asc(figures.sortOrder));
  } catch {
    return [];
  }
}

export async function listAllFigures(includeInactive = false): Promise<Figure[]> {
  const db = getDb();
  if (includeInactive) {
    return db.select().from(figures).orderBy(asc(figures.groupKey), asc(figures.sortOrder));
  }
  return db
    .select()
    .from(figures)
    .where(eq(figures.isActive, true))
    .orderBy(asc(figures.groupKey), asc(figures.sortOrder));
}

export async function upsertFigure(
  input: NewFigure & { key: string },
): Promise<Figure> {
  const db = getDb();
  const existing = await db
    .select({ id: figures.id })
    .from(figures)
    .where(eq(figures.key, input.key))
    .limit(1);

  if (existing[0]) {
    const [updated] = await db
      .update(figures)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(figures.id, existing[0].id))
      .returning();
    return updated!;
  }

  const [created] = await db.insert(figures).values(input).returning();
  return created!;
}

export async function updateFigureById(
  id: string,
  patch: Partial<NewFigure>,
): Promise<Figure | null> {
  const db = getDb();
  const [updated] = await db
    .update(figures)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(figures.id, id))
    .returning();
  return updated ?? null;
}
