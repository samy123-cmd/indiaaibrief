"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${origin}/auth/callback?redirect_url=${encodeURIComponent("/update-password")}`,
        },
      );
      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }
      setMessage(
        "If an account exists for that email, we sent a reset link. Check your inbox.",
      );
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary">
          Work email
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
        {loading ? "Sending link…" : "Send reset link"}
      </Button>
    </form>
  );
}
