import { buildMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "Terms of service for IndiaAIBrief — subscriptions, digital products, content ownership, and governing law (India).",
  path: "/terms",
});

const UPDATED = "24 July 2026";

export default function TermsPage() {
  return (
    <article className="prose-article mx-auto px-4 py-12">
      <h1>Terms of Service</h1>
      <p>Last updated: {UPDATED}</p>
      <p>
        By accessing indiaaibrief.com or purchasing products/subscriptions, you
        agree to these Terms. If you do not agree, do not use the service.
      </p>

      <h2>User rights</h2>
      <p>
        You may read free content on the site. We may introduce metered access for
        guests in the future; paid membership benefits are described on the
        Subscribe page and apply once checkout is live for your plan.
      </p>

      <h2>Subscription terms</h2>
      <ul>
        <li>
          Brief and Intelligence may be offered as founding waitlists before
          Razorpay checkout opens; joining a list does not charge your card
        </li>
        <li>
          When paid plans are live, they renew monthly or annually via Razorpay
          (UPI, cards, netbanking)
        </li>
        <li>Prices are shown in INR inclusive of applicable taxes unless stated</li>
        <li>
          Cancel anytime once subscribed; access continues through the paid
          period. See <a href="/refund">Refund Policy</a>
        </li>
      </ul>

      <h2>Content ownership</h2>
      <p>
        All original editorial content, datasets, and product materials are owned by
        IndiaAIBrief or its licensors. You may not scrape, republish, or resell our
        content without written permission.
      </p>

      <h2>Prohibited use</h2>
      <ul>
        <li>Automated scraping that degrades service or violates robots rules</li>
        <li>Sharing paid credentials or download links publicly</li>
        <li>Uploading malware or attempting to breach security</li>
        <li>Misrepresenting affiliation with IndiaAIBrief</li>
      </ul>

      <h2>Termination</h2>
      <p>
        We may suspend accounts that violate these Terms. You may close your account
        by contacting{" "}
        <a href="mailto:hello@indiaaibrief.com">hello@indiaaibrief.com</a>.
      </p>

      <h2>Liability limitation</h2>
      <p>
        Content is for informational purposes and is not legal, financial, or
        investment advice. To the maximum extent permitted by law, IndiaAIBrief is
        not liable for indirect or consequential damages arising from use of the
        site or products.
      </p>

      <h2>Governing law & dispute resolution</h2>
      <p>
        These Terms are governed by the laws of India. Disputes shall first be
        attempted in good faith negotiation; failing that, exclusive jurisdiction
        lies with the courts of Bengaluru, Karnataka, India.
      </p>
    </article>
  );
}
