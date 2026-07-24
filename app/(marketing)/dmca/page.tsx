import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/seo";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "DMCA & Content Removal — IndiaAIBrief",
  description:
    "How to report copyright infringement or request content removal from IndiaAIBrief. 48-hour response SLA.",
  path: "/dmca",
});

export default function DmcaPage() {
  return (
    <article className="mx-auto w-full max-w-[680px] px-4 py-12 prose-article">
      <h1>DMCA &amp; content removal</h1>
      <p className="text-sm text-text-secondary">
        Last updated: 24 July 2026
      </p>

      <p>
        IndiaAIBrief respects intellectual property rights. If you believe
        content on this site infringes your copyright, or you have a legitimate
        removal request, follow the process below. We respond within{" "}
        <strong>48 hours</strong> of a complete notice.
      </p>

      <h2>1. Copyright infringement notice</h2>
      <p>Email <a href="mailto:legal@indiaaibrief.com">legal@indiaaibrief.com</a> with:</p>
      <ul>
        <li>Your full name, postal address, and email</li>
        <li>Description of the copyrighted work claimed to be infringed</li>
        <li>
          Exact URL(s) of the allegedly infringing material on{" "}
          {SITE.url}
        </li>
        <li>
          A statement that you have a good-faith belief the use is not
          authorized by the copyright owner, its agent, or the law
        </li>
        <li>
          A statement, under penalty of perjury, that the information in the
          notice is accurate and that you are the copyright owner or authorized
          to act on the owner&apos;s behalf
        </li>
        <li>Your physical or electronic signature</li>
      </ul>

      <h2>2. Counter-notification</h2>
      <p>
        If your content was removed and you believe that was a mistake, email
        the same address with a counter-notice identifying the material, stating
        under penalty of perjury that you have a good-faith belief the material
        was removed by mistake or misidentification, and consenting to
        jurisdiction of Indian courts for disputes arising from the notice.
      </p>

      <h2>3. Other content removal</h2>
      <p>
        For factual corrections, privacy requests under India&apos;s DPDP Act,
        or editorial complaints, see our{" "}
        <Link href="/editorial">Editorial Policy</Link> and{" "}
        <Link href="/privacy">Privacy Policy</Link>, or contact{" "}
        <a href={`mailto:${SITE.editorialEmail}`}>{SITE.editorialEmail}</a>.
      </p>

      <h2>4. Response timeline</h2>
      <ul>
        <li>Acknowledgement: within 48 hours</li>
        <li>Takedown or reasoned refusal: as soon as practicable after review</li>
        <li>Counter-notice reinstatement: per applicable law</li>
      </ul>

      <h2>5. What we will not remove without process</h2>
      <p>
        Fair comment, accurate reporting of publicly available facts, and
        lawfully licensed material are not removed merely because a subject
        dislikes coverage. Personality-rights or defamation claims require
        enough detail for us to assess jurisdiction and risk; incomplete
        threats without particulars may be closed without action. We preserve
        logs of notices for compliance and dispute resolution.
      </p>

      <h2>6. Repeat infringement</h2>
      <p>
        Contributors or partners who repeatedly submit infringing material may
        lose publishing access. Readers who abuse the notice process (for
        example, knowingly false claims) may have future notices deprioritized
        after we document the abuse.
      </p>

      <p>
        Prefer a form? Use our <Link href="/contact">contact page</Link> and
        select a legal / press inquiry. Related:{" "}
        <Link href="/editorial">Editorial Policy</Link>,{" "}
        <Link href="/privacy">Privacy</Link>,{" "}
        <Link href="/terms">Terms</Link>.
      </p>
    </article>
  );
}
