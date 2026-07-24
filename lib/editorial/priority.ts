import type { ImpactLevel, IndiaRelevance } from "@/lib/editorial/types";

export function calculatePriority(
  impactLevel: ImpactLevel,
  indiaRelevance: IndiaRelevance,
): number {
  const impactScore: Record<ImpactLevel, number> = {
    critical: 10,
    high: 8,
    medium: 5,
    low: 2,
  };

  const relevanceBoost: Record<IndiaRelevance, number> = {
    direct: 0,
    indirect: -1,
    global_context: -3,
  };

  return Math.max(
    1,
    Math.min(10, impactScore[impactLevel] + relevanceBoost[indiaRelevance]),
  );
}

export function calculateDeadline(
  impactLevel: ImpactLevel,
  from: Date = new Date(),
): Date {
  const hours: Record<ImpactLevel, number> = {
    critical: 4,
    high: 12,
    medium: 36,
    low: 72,
  };

  return new Date(from.getTime() + hours[impactLevel] * 60 * 60 * 1000);
}
