import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/lib/products";
import { buildMetadata } from "@/lib/seo";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Audit booked — confirmation",
  description: "Payment confirmed for the AI Readiness Audit.",
  path: "/audit/confirmed",
  noIndex: true,
});

interface ConfirmedPageProps {
  searchParams: Promise<{
    payment_id?: string;
    order_id?: string;
  }>;
}

export default async function AuditConfirmedPage({
  searchParams,
}: ConfirmedPageProps) {
  const { payment_id, order_id } = await searchParams;
  const paid = Boolean(payment_id || order_id);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 md:py-16">
      <Badge>{paid ? "Payment received" : "Audit booking"}</Badge>
      <h1 className="mt-3 text-[28px] font-extrabold tracking-[-0.02em] md:text-4xl">
        {paid ? "You're booked" : "Confirm your booking"}
      </h1>
      <p className="mt-3 text-base leading-7 text-text-secondary">
        {paid
          ? `Thanks for purchasing ${PRODUCTS.readinessAudit.name}. We start the 47-point scorecard within one business day and email your PDF within 3 business days.`
          : `Complete Razorpay checkout on the audit page (${formatInr(PRODUCTS.readinessAudit.priceInr)}) to lock your slot.`}
      </p>

      {payment_id ? (
        <p className="mt-6 rounded-lg border border-border bg-surface p-4 font-mono text-xs text-foreground">
          Payment ID: {payment_id}
        </p>
      ) : null}

      <ol className="mt-8 space-y-4 text-sm text-text-secondary">
        <li>
          <span className="font-semibold text-foreground">1. Inbox</span> — watch
          for a kickoff email from hello@indiaaibrief.com (check spam).
        </li>
        <li>
          <span className="font-semibold text-foreground">2. Context pack</span> —
          reply with product summary, data types, and any RFP deadline.
        </li>
        <li>
          <span className="font-semibold text-foreground">3. Report</span> — PDF
          scorecard + 30-minute walkthrough of the top gaps.
        </li>
      </ol>

      <div className="mt-10 flex flex-wrap gap-3">
        {!paid ? (
          <Button asChild size="lg">
            <Link href="/audit">Back to audit</Link>
          </Button>
        ) : null}
        <Button asChild variant="outline" size="lg">
          <Link href="/kit/ai-compliance">Compliance kit</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href="mailto:hello@indiaaibrief.com?subject=AI%20Readiness%20Audit%20kickoff">
            Email kickoff
          </a>
        </Button>
      </div>
    </div>
  );
}
