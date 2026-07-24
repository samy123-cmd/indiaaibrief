import "server-only";

import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EditorialRole } from "@/lib/editorial/types";
import type { SubscriptionTier } from "@/types";

export interface AppProfile {
  id: string;
  email: string | null;
  role: "user" | "editor" | "admin";
  subscriptionTier: SubscriptionTier;
}

export async function getSessionUser(): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function getAuthUserId(): Promise<string | null> {
  const user = await getSessionUser();
  return user?.id ?? null;
}

export async function requireAuthUserId(): Promise<string> {
  const id = await getAuthUserId();
  if (!id) throw new Error("Authentication required");
  return id;
}

export async function getProfile(
  userId?: string,
): Promise<AppProfile | null> {
  const supabase = await createSupabaseServerClient();
  const id = userId ?? (await getAuthUserId());
  if (!id) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, subscription_tier")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    // Fallback from auth user metadata if profile row missing
    const user = await getSessionUser();
    if (!user || user.id !== id) return null;
    const metaRole = user.app_metadata?.role ?? user.user_metadata?.role;
    const metaTier =
      user.app_metadata?.subscription_tier ??
      user.user_metadata?.subscription_tier;
    return {
      id: user.id,
      email: user.email ?? null,
      role:
        metaRole === "admin" || metaRole === "editor" ? metaRole : "user",
      subscriptionTier: normalizeTier(metaTier),
    };
  }

  return {
    id: data.id as string,
    email: (data.email as string | null) ?? null,
    role:
      data.role === "admin" || data.role === "editor"
        ? (data.role as EditorialRole)
        : "user",
    subscriptionTier: normalizeTier(data.subscription_tier),
  };
}

function normalizeTier(value: unknown): SubscriptionTier {
  if (
    value === "guest" ||
    value === "free" ||
    value === "brief" ||
    value === "intelligence" ||
    value === "admin"
  ) {
    return value;
  }
  return "free";
}

export async function getSubscriptionTier(): Promise<SubscriptionTier> {
  const profile = await getProfile();
  if (!profile) return "guest";
  if (profile.role === "admin") return "admin";
  return profile.subscriptionTier === "guest"
    ? "free"
    : profile.subscriptionTier;
}

export function canAccessUnlimitedArticles(tier: SubscriptionTier): boolean {
  return tier === "brief" || tier === "intelligence" || tier === "admin";
}

export function canAccessDownloads(tier: SubscriptionTier): boolean {
  return tier === "intelligence" || tier === "admin";
}

export function canAccessDashboard(tier: SubscriptionTier): boolean {
  return tier !== "guest";
}

export function canAccessAdvancedFilters(tier: SubscriptionTier): boolean {
  return tier === "brief" || tier === "intelligence" || tier === "admin";
}

export async function getAdvancedFiltersAccess(): Promise<{
  unlocked: boolean;
  tier: SubscriptionTier;
}> {
  try {
    const tier = await getSubscriptionTier();
    return {
      unlocked: canAccessAdvancedFilters(tier),
      tier,
    };
  } catch {
    return { unlocked: false, tier: "guest" };
  }
}

export async function getEditorialRoleFromProfile(): Promise<EditorialRole | null> {
  const profile = await getProfile();
  if (!profile) return null;
  if (profile.role === "admin" || profile.role === "editor") {
    return profile.role;
  }
  if (profile.subscriptionTier === "admin") return "admin";
  return null;
}
