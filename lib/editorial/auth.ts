import "server-only";

import type { NextRequest } from "next/server";
import {
  getAuthUserId,
  getEditorialRoleFromProfile,
  getSubscriptionTier,
} from "@/lib/auth";
import type { EditorialRole } from "@/lib/editorial/types";

export async function getEditorialRole(): Promise<EditorialRole | null> {
  return getEditorialRoleFromProfile();
}

export async function requireEditor(): Promise<{
  userId: string;
  role: EditorialRole;
}> {
  const userId = await getAuthUserId();
  if (!userId) {
    throw new EditorialAuthError("Authentication required", 401);
  }

  const role = await getEditorialRole();
  if (!role) {
    throw new EditorialAuthError("Editor or admin role required", 403);
  }

  return { userId, role };
}

export function requireCronAuth(request: NextRequest): void {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret) {
    if (process.env.NODE_ENV === "development") return;
    throw new EditorialAuthError("CRON_SECRET is not configured", 500);
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    throw new EditorialAuthError("Unauthorized cron request", 401);
  }
}

export function requireIngestKey(request: NextRequest): void {
  const ingestKey = process.env.INGEST_API_KEY;
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (process.env.NODE_ENV === "development" && !ingestKey && !cronSecret) {
    return;
  }

  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token || (token !== ingestKey && token !== cronSecret)) {
    throw new EditorialAuthError("Unauthorized ingest request", 401);
  }
}

export function requireCronOrIngestAuth(request: NextRequest): void {
  const cronSecret = process.env.CRON_SECRET;
  const ingestKey = process.env.INGEST_API_KEY;
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (process.env.NODE_ENV === "development" && !cronSecret && !ingestKey) {
    return;
  }

  if (!token || (token !== cronSecret && token !== ingestKey)) {
    throw new EditorialAuthError("Unauthorized", 401);
  }
}

export class EditorialAuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "EditorialAuthError";
    this.status = status;
  }
}

export function authErrorResponse(error: unknown): Response {
  if (error instanceof EditorialAuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}

export async function canAccessEditorial(): Promise<boolean> {
  try {
    const role = await getEditorialRole();
    if (role) return true;
    const tier = await getSubscriptionTier();
    return tier === "admin";
  } catch {
    return false;
  }
}
