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
        We do <strong>not</strong> use advertising or third-party tracking cookies.
        Site analytics use <strong>Plausible</strong>, which is cookie-less and does
        not store personal identifiers on your device.
      </p>

      <h2>What we store locally</h2>
      <ul>
        <li>
          <strong>Theme preference</strong> — light/dark/system choice in a
          first-party cookie (<code>iab_theme</code>) and/or localStorage so the UI
          does not flash on load
        </li>
        <li>
          <strong>Newsletter sticky dismiss</strong> — a local flag so the mobile
          banner stays dismissed for the session
        </li>
        <li>
          <strong>Future meter (optional)</strong> — if we introduce metered free
          reading, a view count may be stored in localStorage and/or your account;
          we will update this policy before that ships
        </li>
      </ul>

      <h2>Essential cookies</h2>
      <p>
        If you sign in, Supabase Auth may set session cookies required to keep
        your session secure. Those are essential for account features, not for
        advertising.
      </p>

      <h2>Managing preferences</h2>
      <p>
        Clear site data in your browser to reset theme flags. Unsubscribing from
        email is separate — use the link in any newsletter.
      </p>

      <h2>Contact</h2>
      <p>
        Questions:{" "}
        <a href="mailto:hello@indiaaibrief.com">hello@indiaaibrief.com</a>
      </p>
    </article>
  );
}
