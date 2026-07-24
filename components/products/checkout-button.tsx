"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatInr } from "@/lib/utils";

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { email?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface CheckoutButtonProps {
  product: string;
  productName: string;
  priceInr: number;
  className?: string;
  /** Extra intake fields for services (audit). */
  collectCompany?: boolean;
  ctaLabel?: string;
  finePrint?: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutButton({
  product,
  productName,
  priceInr,
  className,
  collectCompany = false,
  ctaLabel,
  finePrint = "Pay via UPI, cards, or netbanking. 7-day refund on digital products.",
}: CheckoutButtonProps) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "redirecting" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const startCheckout = useCallback(async () => {
    setStatus("loading");
    setMessage("");

    if (!email.trim() || !email.includes("@")) {
      setStatus("error");
      setMessage("Enter a valid work email for delivery and receipt.");
      return;
    }

    if (collectCompany && !company.trim()) {
      setStatus("error");
      setMessage("Company name is required for the audit intake.");
      return;
    }

    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          email: email.trim(),
          company: company.trim(),
          website: website.trim(),
        }),
      });
      const orderData = (await orderRes.json()) as {
        error?: string;
        orderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
        product?: string;
      };

      if (!orderRes.ok || !orderData.orderId || !orderData.keyId) {
        throw new Error(
          orderData.error ??
            "Unable to start checkout. Razorpay keys may not be configured yet — email hello@indiaaibrief.com to book manually.",
        );
      }

      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) {
        throw new Error("Razorpay checkout failed to load. Try again.");
      }

      setStatus("redirecting");

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount ?? priceInr * 100,
        currency: orderData.currency ?? "INR",
        name: "IndiaAIBrief",
        description: productName,
        order_id: orderData.orderId,
        prefill: { email: email.trim() },
        notes: {
          product,
          email: email.trim(),
          company: company.trim(),
          website: website.trim(),
        },
        theme: { color: "#DC2626" },
        handler: async (response) => {
          setStatus("loading");
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                product,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = (await verifyRes.json()) as {
              error?: string;
              downloadPath?: string;
            };
            if (!verifyRes.ok || !verifyData.downloadPath) {
              throw new Error(verifyData.error ?? "Payment verification failed");
            }
            window.location.assign(verifyData.downloadPath);
          } catch (error) {
            setStatus("error");
            setMessage(
              error instanceof Error
                ? error.message
                : "Payment succeeded but confirmation failed. Email hello@indiaaibrief.com with your payment ID.",
            );
          }
        },
        modal: {
          ondismiss: () => {
            setStatus("idle");
          },
        },
      });

      rzp.open();
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Checkout failed. Try again.",
      );
    }
  }, [
    email,
    company,
    website,
    collectCompany,
    product,
    productName,
    priceInr,
  ]);

  return (
    <div className={className}>
      {collectCompany ? (
        <label className="mb-3 block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-text-tertiary">
            Company
          </span>
          <Input
            type="text"
            name="company"
            autoComplete="organization"
            required
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="Acme Labs Pvt Ltd"
            aria-label="Company name"
          />
        </label>
      ) : null}
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-text-tertiary">
          Work email
        </span>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          aria-label="Email for product delivery"
        />
      </label>
      {collectCompany ? (
        <label className="mt-3 block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-text-tertiary">
            Website (optional)
          </span>
          <Input
            type="url"
            name="website"
            autoComplete="url"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://"
            aria-label="Company website"
          />
        </label>
      ) : null}
      <Button
        type="button"
        size="lg"
        className="mt-4 w-full"
        disabled={status === "loading" || status === "redirecting"}
        onClick={startCheckout}
      >
        {status === "loading" || status === "redirecting"
          ? "Opening Razorpay…"
          : (ctaLabel ?? `Buy now — ${formatInr(priceInr)}`)}
      </Button>
      {message ? (
        <p
          className={`mt-3 text-sm ${status === "error" ? "text-accent" : "text-text-secondary"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-text-tertiary">{finePrint}</p>
    </div>
  );
}
