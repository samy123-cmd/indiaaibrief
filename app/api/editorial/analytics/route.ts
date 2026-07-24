import {
  authErrorResponse,
  requireEditor,
} from "@/lib/editorial/auth";
import { getEditorialAnalytics } from "@/lib/editorial/queries";

export async function GET() {
  try {
    await requireEditor();
    const analytics = await getEditorialAnalytics();
    return Response.json(analytics);
  } catch (error) {
    return authErrorResponse(error);
  }
}
