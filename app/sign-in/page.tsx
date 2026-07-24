import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Sign in — IndiaAIBrief",
  description:
    "Sign in to your IndiaAIBrief membership desk — dashboard, bookmarks, and member features.",
  path: "/sign-in",
  noIndex: true,
});

export default function SignInPage() {
  const configured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Enter your desk"
      description={
        configured
          ? "Access your dashboard, saved reading, and member tools."
          : "Sign-in is temporarily unavailable. Email hello@indiaaibrief.com for help."
      }
      footer={
        <p className="text-center text-xs text-text-tertiary">
          Looking for plans?{" "}
          <Link href="/subscribe" className="text-accent hover:text-accent-hover">
            View membership
          </Link>
        </p>
      }
    >
      {configured ? (
        <Suspense
          fallback={
            <p className="text-sm text-text-secondary">Loading sign-in…</p>
          }
        >
          <SignInForm />
        </Suspense>
      ) : (
        <div className="space-y-4">
          <p className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
            Sign-in is offline right now. Email{" "}
            <a
              href="mailto:hello@indiaaibrief.com"
              className="font-medium text-accent hover:text-accent-hover"
            >
              hello@indiaaibrief.com
            </a>
            .
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Back to homepage</Link>
          </Button>
        </div>
      )}
    </AuthShell>
  );
}
