import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/lib/products";
import { formatInr } from "@/lib/utils";

export function ProductCta({
  variant = "kit",
}: {
  variant?: "kit" | "audit" | "subscribe";
}) {
  if (variant === "subscribe") {
    return (
      <Card className="border-accent/30">
        <CardHeader>
          <Badge variant="outline">The Brief</Badge>
          <CardTitle className="text-xl">Unlimited Indian AI intelligence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-secondary">
            Free account today. Brief founding list opens UPI checkout when ready —
            unlocks advanced trackers and the weekly insider brief.
          </p>
          <Button asChild>
            <Link href="/subscribe">View membership</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (variant === "audit") {
    return (
      <Card>
        <CardHeader>
          <Badge>Service</Badge>
          <CardTitle className="text-xl">{PRODUCTS.readinessAudit.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-secondary">
            47-point scorecard for Indian MSMEs and product teams. 3-day turnaround.
          </p>
          <Button asChild>
            <Link href="/audit">
              Book audit — {formatInr(PRODUCTS.readinessAudit.priceInr)}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Badge>Digital product</Badge>
        <CardTitle className="text-xl">{PRODUCTS.complianceKit.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-text-secondary">
          PDF playbook pack + workspace template for DPDP-aware AI deployment in
          India.
        </p>
        <Button asChild>
          <Link href="/kit/ai-compliance">
            Get the kit — {formatInr(PRODUCTS.complianceKit.priceInr)}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
