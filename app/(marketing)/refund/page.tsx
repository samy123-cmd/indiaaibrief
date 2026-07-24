import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Refund Policy",
  description:
    "IndiaAIBrief refunds — 7-day window for digital products if not downloaded; subscriptions non-refundable after access.",
  path: "/refund",
});

const UPDATED = "24 July 2026";

export default function RefundPage() {
  return (
    <article className="prose-article mx-auto px-4 py-12">
      <h1>Refund Policy</h1>
      <p>Last updated: {UPDATED}</p>

      <p>
        This Refund Policy covers one-time digital products and recurring
        subscriptions sold on IndiaAIBrief through Razorpay. It sits alongside
        our <Link href="/terms">Terms of Service</Link>. If anything here
        conflicts with a specific product landing page promise, the more
        customer-favourable written promise applies for that purchase.
      </p>

      <h2>Digital products (one-time)</h2>
      <p>
        Products such as the <strong>AI Compliance Starter Kit (₹999)</strong>{" "}
        include a <strong>7-day refund</strong> if you have not completed
        substantial download use (PDF, checklist, or Notion template access).
        &quot;Substantial download use&quot; means you retrieved the primary
        deliverables after checkout. If downloads were completed, refunds are
        discretionary and we may ask what was missing so we can improve the
        product.
      </p>
      <p>
        The <strong>AI Readiness Audit (₹4,999)</strong> is a productized
        service. If we have not started the audit, email us within 48 hours of
        payment with your Razorpay payment ID for a full refund. Once work has
        started (intake reviewed or draft scoring begun), the fee is
        non-refundable.
      </p>

      <h2>Subscriptions</h2>
      <p>
        Brief and Intelligence subscriptions are <strong>non-refundable</strong>{" "}
        after content access is granted for the billing period. You may cancel
        renewal anytime from your account or by emailing support; access
        continues until the paid period ends. Annual plans follow the same rule
        unless a launch promotion explicitly states otherwise in writing on the
        subscribe page at the time of purchase.
      </p>

      <h2>How to request a refund</h2>
      <ol>
        <li>
          Email{" "}
          <a href="mailto:hello@indiaaibrief.com">hello@indiaaibrief.com</a> with
          subject line <code>Refund request</code>
        </li>
        <li>Include your Razorpay payment ID and purchase email</li>
        <li>
          For kits: state whether files or Notion access were opened; for
          audits: whether you received a kickoff or draft
        </li>
      </ol>
      <p>
        We acknowledge requests within <strong>48 hours</strong> and process
        approved refunds to the original payment method via Razorpay. Bank
        timelines for UPI, cards, and netbanking vary; we cannot control
        issuer delays after Razorpay initiates the refund.
      </p>

      <h2>Chargebacks</h2>
      <p>
        Contact us before filing a chargeback — we resolve most issues faster
        than the bank process. Unexplained chargebacks may result in account
        suspension for abuse prevention while we investigate.
      </p>

      <h2>Related pages</h2>
      <p>
        See <Link href="/kit/ai-compliance">AI Compliance Kit</Link>,{" "}
        <Link href="/audit">AI Readiness Audit</Link>,{" "}
        <Link href="/subscribe">Subscribe</Link>, and{" "}
        <Link href="/contact">Contact</Link> for product details and support.
      </p>
    </article>
  );
}
