import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProfile, getSessionUser } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Account settings",
  description: "Manage your IndiaAIBrief account.",
  path: "/dashboard/settings",
  noIndex: true,
});

export default async function SettingsPage() {
  const user = await getSessionUser();
  const profile = await getProfile();
  const tier = profile?.subscriptionTier ?? "free";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="text-[32px] font-extrabold tracking-[-0.02em]">Settings</h1>
      <p className="mt-2 text-text-secondary">
        Account via Supabase Auth. Billing for paid plans opens with founding
        checkout.
      </p>

      {user ? (
        <div className="mt-8 space-y-6 rounded-lg border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">
              <span className="text-text-tertiary">Email</span>
              <br />
              <strong>{user.email}</strong>
            </p>
            <Badge variant="outline">{tier}</Badge>
          </div>
          <p className="text-sm">
            <span className="text-text-tertiary">Role:</span>{" "}
            <strong>{profile?.role ?? "user"}</strong>
          </p>
          <p className="text-sm text-text-secondary">
            To move to Brief or Intelligence, join the founding list. We email
            before any charge.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild>
              <Link href="/subscribe">View membership</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/update-password">Change password</Link>
            </Button>
            <SignOutButton />
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      ) : (
        <Button asChild className="mt-8">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      )}
    </div>
  );
}
