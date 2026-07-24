import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Set new password",
  description: "Choose a new password for your IndiaAIBrief account.",
  path: "/update-password",
  noIndex: true,
});

export default function UpdatePasswordPage() {
  const configured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Set a new password"
      description={
        configured
          ? "Choose a strong password for your membership desk. Open this page from the reset email link."
          : "Password updates are temporarily unavailable. Email hello@indiaaibrief.com."
      }
      footer={
        <p className="text-center text-xs text-text-tertiary">
          Back to{" "}
          <Link href="/sign-in" className="text-accent hover:text-accent-hover">
            sign in
          </Link>
        </p>
      }
    >
      {configured ? (
        <UpdatePasswordForm />
      ) : (
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Back to homepage</Link>
        </Button>
      )}
    </AuthShell>
  );
}
