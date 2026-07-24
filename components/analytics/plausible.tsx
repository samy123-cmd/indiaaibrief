import Script from "next/script";

interface PlausibleAnalyticsProps {
  domain?: string;
  scriptSrc?: string;
  api?: string;
}

export function PlausibleAnalytics({
  domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "indiaaibrief.com",
  scriptSrc = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC ??
    "https://plausible.io/js/script.js",
  api = process.env.NEXT_PUBLIC_PLAUSIBLE_API ??
    "https://plausible.io/api/event",
}: PlausibleAnalyticsProps) {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <Script
      defer
      data-domain={domain}
      data-api={api}
      src={scriptSrc}
      strategy="lazyOnload"
    />
  );
}
