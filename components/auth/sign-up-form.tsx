"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function passwordStrength(password: string): {
  score: number;
  label: string;
} {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ["Too short", "Basic", "Good", "Strong", "Excellent"];
  return { score, label: labels[score] ?? "Too short" };
}

function SignUpFormInner() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect_url") || "/dashboard";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      const { data, error: signError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?redirect_url=${encodeURIComponent(redirectTo)}`,
          data: {
            full_name: name.trim() || undefined,
          },
        },
      });
      if (signError) {
        setError(signError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        router.replace(redirectTo);
        router.refresh();
        return;
      }

      setMessage(
        "Check your inbox for a confirmation link — then you’re in.",
      );
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account");
      setLoading(false);
    }
  }

  const signInHref =
    redirectTo && redirectTo !== "/dashboard"
      ? `/sign-in?redirect_url=${encodeURIComponent(redirectTo)}`
      : "/sign-in";

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field
        label="Your name"
        hint="How we’ll address you in the Brief"
      >
        <Input
          name="name"
          autoComplete="name"
          placeholder="Priya Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Your name"
        />
      </Field>

      <Field label="Work email" hint="We’ll send the Brief here">
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@company.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Work email"
        />
      </Field>

      <Field label="Password" hint="At least 8 characters">
        <div className="relative">
          <Input
            className="pr-12"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Create a secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password"
          />
          <button
            type="button"
            className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-text-tertiary hover:bg-muted hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
        {password ? (
          <div className="mt-2.5" aria-live="polite">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full bg-muted",
                    strength.score > i &&
                      (strength.score <= 2
                        ? "bg-accent"
                        : strength.score === 3
                          ? "bg-warning"
                          : "bg-success"),
                  )}
                />
              ))}
            </div>
            <p className="mt-1.5 text-xs text-text-tertiary">
              Strength: {strength.label}
            </p>
          </div>
        ) : null}
      </Field>

      {error ? (
        <p
          className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm text-accent"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p
          className="rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text-secondary"
          role="status"
        >
          {message}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Setting up your desk…" : "Join IndiaAIBrief — free"}
      </Button>

      <p className="text-center text-xs leading-5 text-text-tertiary">
        By joining you agree to our{" "}
        <Link href="/terms" className="text-text-secondary underline-offset-2 hover:text-accent hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-text-secondary underline-offset-2 hover:text-accent hover:underline">
          Privacy Policy
        </Link>
        . No card required.
      </p>

      <p className="text-center text-sm text-text-secondary">
        Already a member?{" "}
        <Link
          href={signInHref}
          className="font-medium text-accent hover:text-accent-hover"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary">
          {label}
        </span>
        {hint ? (
          <span className="text-[11px] text-text-tertiary">{hint}</span>
        ) : null}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export function SignUpForm() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-text-secondary">Loading membership form…</p>
      }
    >
      <SignUpFormInner />
    </Suspense>
  );
}
