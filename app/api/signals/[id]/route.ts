import {
  authErrorResponse,
  requireEditor,
} from "@/lib/editorial/auth";
import {
  getRelatedSignals,
  getSignalById,
} from "@/lib/editorial/queries";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireEditor();
    const { id } = await context.params;
    const signal = await getSignalById(id);
    if (!signal) {
      return Response.json({ error: "Signal not found" }, { status: 404 });
    }

    const related = await getRelatedSignals(
      signal.id,
      signal.tags,
      signal.relatedStartups,
    );

    return Response.json({ signal, related });
  } catch (error) {
    return authErrorResponse(error);
  }
}
