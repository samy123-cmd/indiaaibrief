import Link from "next/link";
import { PlanInterestForm } from "@/components/products/plan-interest-form";
import { ProductCta } from "@/components/products/product-cta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRODUCTS } from "@/lib/products";
import { buildMetadata } from "@/lib/seo";
import { formatInr } from "@/lib/utils";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Subscribe — The Brief",
  description:
    "Free account today. Brief (₹299/mo) and Intelligence (₹999/mo) founding lists open. Kit and audit available to buy now.",
  path: "/subscribe",
});

export default function SubscribePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="max-w-2xl">
        <Badge variant="outline">Membership</Badge>
        <h1 className="mt-3 text-[32px] font-extrabold tracking-[-0.02em] md:text-5xl md:leading-[56px]">
          Subscribe to The Brief
        </h1>
        <p className="mt-3 text-text-secondary">
          Create a free account now. Paid memberships open with UPI checkout for
          founding members — join the list below. Products you can buy today sit
          under the plans.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Badge variant="outline">Available now</Badge>
            <CardTitle className="mt-2">Free</CardTitle>
            <p className="text-3xl font-extrabold tracking-tight">
              {formatInr(0)}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• Full article library (launch)</li>
              <li>• Weekly newsletter</li>
              <li>• Account + bookmarks soon</li>
            </ul>
            <Button asChild className="w-full" variant="outline">
              <Link href="/sign-up">Create free account</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-accent shadow-md">
          <CardHeader>
            <Badge>Founding list</Badge>
            <CardTitle className="mt-2">Brief</CardTitle>
            <p className="text-3xl font-extrabold tracking-tight">
              {formatInr(299)}
              <span className="text-sm font-medium text-text-secondary">/mo</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• Unlimited articles when meter ships</li>
              <li>• Weekly insider brief</li>
              <li>• Advanced tracker filters</li>
              <li>• Cancel anytime</li>
            </ul>
            <PlanInterestForm plan="brief" ctaLabel="Join Brief founding list" />
            <p className="text-xs text-text-tertiary">
              Checkout opens via Razorpay (UPI, cards, netbanking). No charge
              until we email you.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="outline">Founding list</Badge>
            <CardTitle className="mt-2">Intelligence</CardTitle>
            <p className="text-3xl font-extrabold tracking-tight">
              {formatInr(999)}
              <span className="text-sm font-medium text-text-secondary">/mo</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• Everything in Brief</li>
              <li>• Exclusive data downloads</li>
              <li>• Monthly 1:1 call</li>
              <li>• Priority product access</li>
            </ul>
            <PlanInterestForm
              plan="intelligence"
              ctaLabel="Join Intelligence list"
            />
            <p className="text-xs text-text-tertiary">
              Limited founding seats. We email before charging.
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          Buy today — no waitlist
        </h2>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Digital kit and readiness audit checkout via Razorpay. Instant delivery
          for the kit; 3-day turnaround for the audit.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ProductCta variant="kit" />
          <ProductCta variant="audit" />
        </div>
        <p className="mt-4 text-sm text-text-tertiary">
          Kit {formatInr(PRODUCTS.complianceKit.priceInr)} one-time · Audit{" "}
          {formatInr(PRODUCTS.readinessAudit.priceInr)} one-time · 7-day refund
          on digital products
        </p>
      </section>
    </div>
  );
}
