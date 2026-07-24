"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError(
          "Your reset link expired or is missing. Request a new password reset email.",
        );
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setMessage("Password updated. Taking you to your desk…");
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary">
          New password
        </span>
        <span className="relative mt-2 block">
          <Input
            className="pr-12"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="New password"
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

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary">
          Confirm password
        </span>
        <Input
          className="mt-2"
          type={showPassword ? "text" : "password"}
          name="confirm"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Repeat new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-label="Confirm password"
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
        {loading ? "Updating…" : "Set new password"}
      </Button>
    </form>
  );
}
