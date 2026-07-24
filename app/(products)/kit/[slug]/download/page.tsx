import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDigitalProduct } from "@/lib/products";
import { verifyDownloadToken } from "@/lib/payments";
import { buildMetadata } from "@/lib/seo";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Download — AI Compliance Starter Kit",
  description:
    "Secure download page for the AI Compliance Starter Kit after Razorpay payment.",
  path: "/kit/ai-compliance/download",
  noIndex: true,
});

interface DownloadPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    order_id?: string;
    payment_id?: string;
    token?: string;
  }>;
}

export default async function KitDownloadPage({
  params,
  searchParams,
}: DownloadPageProps) {
  const { slug } = await params;
  const { order_id, payment_id, token } = await searchParams;
  const product = getDigitalProduct(slug);

  if (!product) {
    return (
      <DownloadShell>
        <p className="text-text-secondary">Product not found.</p>
        <Button asChild className="mt-6">
          <Link href="/kit/ai-compliance">Back to kit</Link>
        </Button>
      </DownloadShell>
    );
  }

  const authorized =
    Boolean(order_id && payment_id && token) &&
    verifyDownloadToken({
      product: product.slug,
      orderId: order_id ?? "",
      paymentId: payment_id ?? "",
      token: token ?? "",
    });

  if (!authorized) {
    return (
      <DownloadShell>
        <Badge variant="outline">Access required</Badge>
        <h1 className="mt-3 text-[28px] font-extrabold tracking-[-0.02em] md:text-4xl">
          Complete purchase to download
        </h1>
        <p className="mt-3 text-text-secondary">
          This page unlocks after a successful Razorpay payment for{" "}
          {product.name}. If you already paid, use the link from checkout or
          email{" "}
          <a
            href="mailto:hello@indiaaibrief.com"
            className="text-accent hover:text-accent-hover"
          >
            hello@indiaaibrief.com
          </a>{" "}
          with your payment ID (download links expire after 7 days).
        </p>
        <Button asChild className="mt-6" size="lg">
          <Link href={`/kit/${product.slug}`}>
            Buy kit — {formatInr(product.priceInr)}
          </Link>
        </Button>
      </DownloadShell>
    );
  }

  const qs = new URLSearchParams({
    order_id: order_id ?? "",
    payment_id: payment_id ?? "",
    token: token ?? "",
  });

  return (
    <DownloadShell>
      <Badge>Payment verified</Badge>
      <h1 className="mt-3 text-[28px] font-extrabold tracking-[-0.02em] md:text-4xl">
        Your kit is ready
      </h1>
      <p className="mt-3 text-text-secondary">
        Thanks for purchasing {product.name}. Download every file below.
        Bookmark this page — it is tied to payment{" "}
        <span className="font-mono text-xs text-foreground">{payment_id}</span>{" "}
        and expires in 7 days.
      </p>

      <div className="mt-6 rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-text-secondary">
        Start with the <strong className="text-foreground">checklist</strong>,
        then skim the playbook, then import the workspace boards. The PDF is the
        printable cover for stakeholders.
      </div>

      <ul className="mt-8 space-y-4">
        {product.deliverables.map((item) => {
          const href = item.downloadPath
            ? `/api/downloads/${product.slug}/${item.downloadPath}?${qs.toString()}`
            : item.href;
          return (
            <li
              key={item.id}
              className="flex flex-col gap-3 border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.05em] text-accent">
                  {item.format}
                </p>
                <p className="mt-1 font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {item.description}
                </p>
              </div>
              {href ? (
                <Button asChild variant="outline" className="shrink-0">
                  <a href={href} download={item.downloadPath}>
                    Download
                  </a>
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/audit">Upgrade to readiness audit</Link>
        </Button>
        <Button asChild variant="outline">
          <a href="mailto:hello@indiaaibrief.com?subject=Kit%20support">
            Email support
          </a>
        </Button>
      </div>

      <p className="mt-8 text-sm text-text-tertiary">
        7-day refund window. Questions?{" "}
        <a
          href="mailto:hello@indiaaibrief.com"
          className="text-accent hover:text-accent-hover"
        >
          hello@indiaaibrief.com
        </a>
      </p>
    </DownloadShell>
  );
}

function DownloadShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">{children}</div>
  );
}
