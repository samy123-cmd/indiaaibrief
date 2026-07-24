import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Join IndiaAIBrief",
  description:
    "Create your free IndiaAIBrief membership — weekly Brief, trackers, and member dashboard. No card required.",
  path: "/sign-up",
  noIndex: true,
});

export default function SignUpPage() {
  const configured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <AuthShell
      eyebrow="Membership"
      title="Join the intelligence desk"
      description={
        configured
          ? "Free membership unlocks your dashboard and newsletter. Brief founding seats open when UPI checkout launches."
          : "Membership is temporarily unavailable. Email hello@indiaaibrief.com and we’ll get you set up."
      }
      footer={
        <p className="text-center text-xs text-text-tertiary">
          Prefer products first?{" "}
          <Link
            href="/kit/ai-compliance"
            className="text-accent hover:text-accent-hover"
          >
            Compliance Kit — ₹999
          </Link>
        </p>
      }
    >
      {configured ? (
        <SignUpForm />
      ) : (
        <div className="space-y-4">
          <p className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
            Account creation is offline right now. Reach us at{" "}
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
