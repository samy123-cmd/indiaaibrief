"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect_url") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signError) {
        setError(signError.message);
        setLoading(false);
        return;
      }
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoading(false);
    }
  }

  const signUpHref =
    redirectTo && redirectTo !== "/dashboard"
      ? `/sign-up?redirect_url=${encodeURIComponent(redirectTo)}`
      : "/sign-up";

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <label className="block">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary">
            Work email
          </span>
        </span>
        <Input
          className="mt-2"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@company.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Work email"
        />
      </label>

      <label className="block">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary">
            Password
          </span>
          <Link
            href="/forgot-password"
            className="text-[11px] font-medium text-accent hover:text-accent-hover"
          >
            Forgot password?
          </Link>
        </span>
        <span className="relative mt-2 block">
          <Input
            className="pr-12"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            required
            minLength={6}
            placeholder="Your password"
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
        </span>
      </label>

      {error ? (
        <p
          className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm text-accent"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Signing you in…" : "Enter your desk"}
      </Button>

      <p className="text-center text-sm text-text-secondary">
        New here?{" "}
        <Link
          href={signUpHref}
          className="font-medium text-accent hover:text-accent-hover"
        >
          Join free
        </Link>
      </p>
    </form>
  );
}
