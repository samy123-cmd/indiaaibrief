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

      <h2>Digital products (one-time)</h2>
      <p>
        Products such as the <strong>AI Compliance Starter Kit (₹999)</strong>{" "}
        include a <strong>7-day refund</strong> if you have not completed
        substantial download use (PDF / checklist / Notion access). If downloads
        were completed, refunds are discretionary.
      </p>

      <h2>Subscriptions</h2>
      <p>
        Brief and Intelligence subscriptions are <strong>non-refundable</strong>{" "}
        after content access is granted for the billing period. You may cancel
        renewal anytime; access continues until the period ends.
      </p>

      <h2>How to request a refund</h2>
      <ol>
        <li>
          Email{" "}
          <a href="mailto:hello@indiaaibrief.com">hello@indiaaibrief.com</a> with
          subject line <code>Refund request</code>
        </li>
        <li>Include your Razorpay payment ID and purchase email</li>
        <li>State whether files were downloaded</li>
      </ol>
      <p>
        We acknowledge requests within <strong>48 hours</strong> and process
        approved refunds to the original payment method via Razorpay.
      </p>

      <h2>Chargebacks</h2>
      <p>
        Contact us before filing a chargeback — we resolve most issues faster than
        the bank process.
      </p>
    </article>
  );
}
