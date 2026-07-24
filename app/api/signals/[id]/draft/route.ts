import { eq } from "drizzle-orm";
import { auditLogs, signals } from "@/drizzle/schema";
import {
  authErrorResponse,
  requireEditor,
} from "@/lib/editorial/auth";
import { generateArticleDraft } from "@/lib/editorial/draft";
import { getSignalById } from "@/lib/editorial/queries";
import { getDb } from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { userId } = await requireEditor();
    const { id } = await context.params;
    const signal = await getSignalById(id);

    if (!signal) {
      return Response.json({ error: "Signal not found" }, { status: 404 });
    }

    const draft = await generateArticleDraft(signal);
    const db = getDb();
    const now = new Date();

    const [updated] = await db
      .update(signals)
      .set({
        aiDraft: draft,
        aiDraftGeneratedAt: now,
        status: "drafting",
        updatedAt: now,
      })
      .where(eq(signals.id, id))
      .returning();

    await db.insert(auditLogs).values({
      signalId: id,
      actorId: userId,
      action: "generate_draft",
      meta: { length: draft.length },
    });

    return Response.json({ ok: true, draft, signal: updated });
  } catch (error) {
    return authErrorResponse(error);
  }
}
