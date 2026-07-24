import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Reset password",
  description: "Reset your IndiaAIBrief account password.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  const configured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description={
        configured
          ? "Enter the email on your membership. We’ll send a secure reset link."
          : "Password reset is temporarily unavailable. Email hello@indiaaibrief.com."
      }
      footer={
        <p className="text-center text-xs text-text-tertiary">
          Remembered it?{" "}
          <Link href="/sign-in" className="text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </p>
      }
    >
      {configured ? (
        <ForgotPasswordForm />
      ) : (
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Back to homepage</Link>
        </Button>
      )}
    </AuthShell>
  );
}
