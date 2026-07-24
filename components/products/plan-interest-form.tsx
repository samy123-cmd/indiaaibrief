"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PlanInterestFormProps {
  plan: "brief" | "intelligence";
  ctaLabel: string;
  className?: string;
}

export function PlanInterestForm({
  plan,
  ctaLabel,
  className,
}: PlanInterestFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          tags: ["founding-members", `${plan}-waitlist`],
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not join the list");
      }

      setStatus("success");
      setMessage(
        plan === "brief"
          ? "You're on the Brief founding list. We'll email you when UPI checkout opens."
          : "You're on the Intelligence founding list. Priority invite when seats open.",
      );
      setEmail("");
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "Something went wrong";
      setStatus("error");
      setMessage(
        `${detail} Or email hello@indiaaibrief.com with subject “${plan} founding list”.`,
      );
    }
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <label className="block">
        <span className="sr-only">Email for {plan} founding list</span>
        <Input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@company.in"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-label={`Email for ${plan} founding list`}
        />
      </label>
      <Button
        type="submit"
        className="mt-3 w-full"
        disabled={status === "loading" || status === "success"}
      >
        {status === "loading" ? "Joining…" : ctaLabel}
      </Button>
      {message ? (
        <p
          className={`mt-3 text-sm ${
            status === "error" ? "text-accent" : "text-success"
          }`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
