import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "optional",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Page Not Found | IndiaAIBrief",
  description: "The page you requested could not be found on IndiaAIBrief.",
  robots: { index: false, follow: false },
};

/**
 * Experimental global 404 for unmatched routes (routing-level, real 404 status).
 * Enabled via experimental.globalNotFound in next.config.ts.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en-IN" className={inter.className}>
      <body className="mx-auto flex min-h-full max-w-[680px] flex-col bg-[#FAFAFA] px-4 py-16 text-[#0A0A0A] antialiased dark:bg-[#0A0A0A] dark:text-[#FAFAFA]">
        <p className="text-xs font-medium uppercase tracking-[0.05em] text-[#DC2626]">
          404
        </p>
        <h1 className="mt-3 text-[32px] font-extrabold tracking-[-0.02em]">
          Page not found
        </h1>
        <p className="mt-3 text-[#525252] dark:text-[#A3A3A3]">
          That URL does not exist — or it moved.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex h-11 items-center justify-center rounded-md bg-[#DC2626] px-6 text-sm font-medium text-white hover:bg-[#B91C1C]"
        >
          Return to home
        </Link>
      </body>
    </html>
  );
}
