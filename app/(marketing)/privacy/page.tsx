import { buildMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "IndiaAIBrief privacy policy — GDPR and India DPDP Act aligned. Minimal cookies; Plausible is cookie-less.",
  path: "/privacy",
});

const UPDATED = "24 July 2026";

export default function PrivacyPage() {
  return (
    <article className="prose-article mx-auto px-4 py-12">
      <h1>Privacy Policy</h1>
      <p>Last updated: {UPDATED}</p>
      <p>
        IndiaAIBrief (&quot;we&quot;, &quot;us&quot;) operates indiaaibrief.com. This
        policy explains what personal data we collect, why, and your rights under
        India&apos;s Digital Personal Data Protection (DPDP) Act and, where
        applicable, the EU GDPR.
      </p>

      <h2>Data we collect</h2>
      <ul>
        <li>Email address for newsletter signup and account registration</li>
        <li>Name and message content when you submit the contact form</li>
        <li>Account profile data processed by Supabase Auth</li>
        <li>
          Payment metadata from Razorpay (amount, order ID, status — not full card
          numbers)
        </li>
        <li>
          Minimal product analytics via Plausible (pageviews, referrers — no
          personal identifiers)
        </li>
      </ul>

      <h2>How we use data</h2>
      <ul>
        <li>Deliver newsletters, product downloads, and subscription access</li>
        <li>Respond to support, press, and partnership inquiries</li>
        <li>Process payments and prevent fraud</li>
        <li>Improve site performance using aggregate, cookie-less analytics</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We do not use advertising or tracking cookies. Analytics use{" "}
        <strong>Plausible</strong>, which is cookie-less. Theme preference may be
        stored in a first-party cookie or localStorage. See our{" "}
        <a href="/cookies">Cookie Policy</a>.
      </p>

      <h2>Third parties</h2>
      <ul>
        <li>Supabase — authentication and database</li>
        <li>Razorpay — payments (India)</li>
        <li>Buttondown — newsletter delivery</li>
        <li>Vercel / Cloudflare — hosting and CDN</li>
        <li>Plausible — analytics</li>
      </ul>
      <p>
        Each processor acts under their own terms for the services they provide to
        us.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the DPDP Act (and GDPR where it applies) you may request access,
        correction, erasure, or withdrawal of consent for processing based on
        consent. Email{" "}
        <a href="mailto:hello@indiaaibrief.com">hello@indiaaibrief.com</a>. We aim
        to respond within 48 hours for acknowledgment and within a reasonable
        period for fulfillment.
      </p>

      <h2>Retention</h2>
      <p>
        Newsletter emails are retained until you unsubscribe. Account data lasts
        while your account is active. Payment records are retained as required for
        tax and dispute resolution. Contact form payloads may be logged
        operationally and purged on a rolling basis.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy requests:{" "}
        <a href="mailto:hello@indiaaibrief.com">hello@indiaaibrief.com</a>
      </p>
    </article>
  );
}
