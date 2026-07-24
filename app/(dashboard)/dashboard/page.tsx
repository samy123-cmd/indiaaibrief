import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canAccessEditorial } from "@/lib/editorial/auth";
import { getProfile, getSessionUser } from "@/lib/auth";
import { PRODUCTS } from "@/lib/products";
import { formatInr } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Dashboard",
  description: "Your IndiaAIBrief account, plan, and products.",
  path: "/dashboard",
  noIndex: true,
});

const TIER_LABEL: Record<string, string> = {
  guest: "Guest",
  free: "Free",
  brief: "Brief",
  intelligence: "Intelligence",
  admin: "Admin",
};

export default async function DashboardPage() {
  const editorial = await canAccessEditorial();
  const user = await getSessionUser();
  const profile = await getProfile();
  const tier = profile?.subscriptionTier ?? "free";
  const isPaid = tier === "brief" || tier === "intelligence" || tier === "admin";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-[-0.02em]">
            Dashboard
          </h1>
          <p className="mt-2 text-text-secondary">
            {user?.email
              ? `Signed in as ${user.email}`
              : "Your IndiaAIBrief account"}
          </p>
        </div>
        <Badge variant={isPaid ? "default" : "outline"}>
          {TIER_LABEL[tier] ?? tier} plan
        </Badge>
      </div>

      <Card className="mt-8 border-accent/20">
        <CardHeader>
          <CardTitle className="text-xl">
            {isPaid ? "Membership active" : "Upgrade when Brief opens"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-secondary">
            {isPaid
              ? "Advanced tracker filters and member features unlock on this account."
              : "Free accounts work today. Brief (₹299/mo) and Intelligence (₹999/mo) founding lists are open — no charge until checkout launches."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/subscribe">
                {isPaid ? "View plans" : "Join founding list"}
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/settings">Account settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {editorial ? (
          <Card>
            <CardHeader>
              <CardTitle>Editorial</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-text-secondary">
                Signal inbox, sources, and publish workflow.
              </p>
              <Button asChild>
                <Link href="/dashboard/editorial">Open editorial</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Bookmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-text-secondary">
              Save articles for later. Library ships with Brief.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/bookmarks">Open bookmarks</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance kit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-text-secondary">
              Playbook + 47-point checklist — {formatInr(PRODUCTS.complianceKit.priceInr)}{" "}
              one-time.
            </p>
            <Button asChild variant="outline">
              <Link href="/kit/ai-compliance">View kit</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Readiness audit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-text-secondary">
              47-point scorecard with 3-day PDF —{" "}
              {formatInr(PRODUCTS.readinessAudit.priceInr)}.
            </p>
            <Button asChild variant="outline">
              <Link href="/audit">Book audit</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trackers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-text-secondary">
              Startup and policy databases. Advanced filters on Brief+.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/startups">Startups</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/policy">Policy</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-text-secondary">
              Email, role, and plan on this account.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/settings">Manage account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
