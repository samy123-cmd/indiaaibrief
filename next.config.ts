import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === "development";

/**
 * Production CSP stays strict (no unsafe-eval).
 * Dev adds unsafe-eval + localhost websockets so React / Turbopack HMR work.
 */
function buildContentSecurityPolicy(): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    // React reconstructs call stacks with eval() in development only.
    ...(isDev ? ["'unsafe-eval'"] : []),
    "https://plausible.io",
    "https://*.plausible.io",
    "https://checkout.razorpay.com",
    "https://*.razorpay.com",
  ];

  const connectSrc = [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://plausible.io",
    "https://*.plausible.io",
    "https://api.razorpay.com",
    "https://*.razorpay.com",
    "https://*.sanity.io",
    "https://cdn.sanity.io",
    // Turbopack / React HMR websockets in local dev.
    ...(isDev ? ["ws:", "wss:", "http://localhost:*", "http://127.0.0.1:*"] : []),
  ];

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://cdn.sanity.io https://*.supabase.co https://*.razorpay.com",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src 'self' https://api.razorpay.com https://*.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: buildContentSecurityPolicy(),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
  turbopack: {
    root,
    resolveAlias: {
      // Drop Next's unconditional modern polyfills — Lighthouse "Legacy JavaScript"
      "next/dist/build/polyfills/polyfill-module": "./lib/empty-polyfill.js",
      "next/dist/build/polyfills/polyfill-module.js": "./lib/empty-polyfill.js",
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "next/dist/build/polyfills/polyfill-module": path.join(
        root,
        "lib/empty-polyfill.js",
      ),
      "next/dist/build/polyfills/polyfill-module.js": path.join(
        root,
        "lib/empty-polyfill.js",
      ),
    };
    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "tivgbbgtrijumtuatihx.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 60,
      static: 86400,
    },
  },
  async redirects() {
    // Collapse apex → www in one hop (Vercel still upgrades http→https).
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "indiaaibrief.com" }],
        destination: "https://www.indiaaibrief.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/llms.txt",
        headers: [
          {
            key: "Content-Type",
            value: "text/markdown; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
      // Do not set Cache-Control on /_next/static — Next.js owns that in
      // development and production; custom headers break Turbopack HMR.
    ];
  },
};

export default nextConfig;
