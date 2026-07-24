import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Cookie Policy",
  description:
    "IndiaAIBrief cookie policy — Plausible is cookie-less; localStorage used for theme preference.",
  path: "/cookies",
});

const UPDATED = "24 July 2026";

export default function CookiesPage() {
  return (
    <article className="prose-article mx-auto px-4 py-12">
      <h1>Cookie Policy</h1>
      <p>Last updated: {UPDATED}</p>

      <h2>Short version</h2>
      <p>
        We do <strong>not</strong> use advertising or third-party tracking
        cookies. Site analytics use <strong>Plausible</strong>, which is
        cookie-less and does not store personal identifiers on your device. This
        policy explains what we store locally, why, and how you can clear it.
        For personal data we process when you subscribe, buy a product, or
        contact us, see our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Why we avoid tracking cookies</h2>
      <p>
        IndiaAIBrief is built for performance on Indian mobile networks.
        Advertising pixels, social embeds, and heavy consent banners add
        JavaScript, hurt Core Web Vitals, and collect data we do not need to
        publish intelligence. Plausible gives us aggregate traffic and referrer
        insight without fingerprinting readers. If we ever introduce a
        third-party tool that requires cookies, we will update this page before
        it goes live and limit use to what is necessary.
      </p>

      <h2>What we store locally</h2>
      <ul>
        <li>
          <strong>Theme preference</strong> — light/dark/system choice in a
          first-party cookie (<code>iab_theme</code>) and/or localStorage so the
          UI does not flash on load. This is a functional preference, not an ad
          tracker.
        </li>
        <li>
          <strong>Newsletter sticky dismiss</strong> — a local flag so the
          mobile newsletter banner stays dismissed for the session or until you
          clear site data.
        </li>
        <li>
          <strong>Future meter (optional)</strong> — if we introduce metered free
          reading, a view count may be stored in localStorage and/or your
          account; we will update this policy before that ships.
        </li>
      </ul>

      <h2>Essential cookies</h2>
      <p>
        If you sign in, Supabase Auth may set session cookies required to keep
        your session secure. Those are essential for account features
        (bookmarks, subscription entitlements, dashboard access), not for
        advertising. Payment flows with Razorpay run on Razorpay&apos;s domain
        and are governed by Razorpay&apos;s policies for checkout sessions.
      </p>

      <h2>Analytics detail</h2>
      <p>
        Plausible records pageviews, referrers, and device class without storing
        a persistent cookie on your device. We use that data to improve content
        and product, not to build cross-site advertising profiles. You can read
        more about Plausible&apos;s approach on their website; we do not run
        Google Analytics on this property.
      </p>

      <h2>Managing preferences</h2>
      <p>
        Clear site data for indiaaibrief.com in your browser to reset theme
        flags and local dismissals. Signing out ends auth session cookies for
        account features. Unsubscribing from email is separate — use the link
        in any newsletter. For data access or deletion requests under India&apos;s
        DPDP Act, email{" "}
        <a href="mailto:hello@indiaaibrief.com">hello@indiaaibrief.com</a> as
        described in the Privacy Policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this Cookie Policy:{" "}
        <a href="mailto:hello@indiaaibrief.com">hello@indiaaibrief.com</a>. See
        also <Link href="/terms">Terms</Link> and{" "}
        <Link href="/refund">Refund Policy</Link>.
      </p>
    </article>
  );
}
