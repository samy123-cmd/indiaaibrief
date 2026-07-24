import {
  IMPACT_LEVELS,
  INDIA_RELEVANCE_LEVELS,
  SIGNAL_CATEGORIES,
  SIGNAL_STATUSES,
  type ImpactLevel,
  type IndiaRelevance,
  type SignalCategory,
  type SignalStatus,
} from "@/lib/editorial/types";
import {
  authErrorResponse,
  requireEditor,
} from "@/lib/editorial/auth";
import { listSignals } from "@/lib/editorial/queries";

export async function GET(request: Request) {
  try {
    await requireEditor();

    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");
    const statuses = statusParam
      ? statusParam
          .split(",")
          .filter((s): s is SignalStatus =>
            SIGNAL_STATUSES.includes(s as SignalStatus),
          )
      : undefined;

    const category = url.searchParams.get("category");
    const impactLevel = url.searchParams.get("impactLevel");
    const indiaRelevance = url.searchParams.get("indiaRelevance");
    const source = url.searchParams.get("source") ?? undefined;
    const assignedTo = url.searchParams.get("assignedTo") ?? undefined;
    const q = url.searchParams.get("q") ?? undefined;
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "20");

    const result = await listSignals({
      status: statuses && statuses.length === 1 ? statuses[0] : statuses,
      category:
        category && SIGNAL_CATEGORIES.includes(category as SignalCategory)
          ? (category as SignalCategory)
          : undefined,
      impactLevel:
        impactLevel && IMPACT_LEVELS.includes(impactLevel as ImpactLevel)
          ? (impactLevel as ImpactLevel)
          : undefined,
      indiaRelevance:
        indiaRelevance &&
        INDIA_RELEVANCE_LEVELS.includes(indiaRelevance as IndiaRelevance)
          ? (indiaRelevance as IndiaRelevance)
          : undefined,
      source,
      assignedTo,
      q,
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? limit : 20,
    });

    return Response.json(result);
  } catch (error) {
    return authErrorResponse(error);
  }
}
