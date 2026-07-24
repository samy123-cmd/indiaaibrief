import { z } from "zod";
import {
  authErrorResponse,
  requireEditor,
} from "@/lib/editorial/auth";
import { applySignalAction } from "@/lib/editorial/queries";
import { SIGNAL_ACTIONS } from "@/lib/editorial/types";

const bodySchema = z.object({
  action: z.enum(SIGNAL_ACTIONS),
  notes: z.string().max(5000).optional(),
  assignedTo: z.string().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireEditor();
    const { id } = await context.params;
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await applySignalAction({
      signalId: id,
      action: parsed.data.action,
      actorId: userId,
      notes: parsed.data.notes,
      assignedTo: parsed.data.assignedTo,
    });

    return Response.json({ ok: true, signal: updated });
  } catch (error) {
    return authErrorResponse(error);
  }
}
