import type { NavItem } from "@/types";

/** Primary nav — shown center on desktop, Sheet overlay on mobile. */
export const PRIMARY_NAV: NavItem[] = [
  { label: "News", href: "/news" },
  { label: "Explains", href: "/explains" },
  { label: "Compares", href: "/compares" },
  { label: "Playbooks", href: "/playbooks" },
  { label: "Startups", href: "/startups" },
  { label: "Policy", href: "/policy" },
];

export const FOOTER_CATEGORIES: NavItem[] = [
  { label: "News", href: "/news" },
  { label: "Explains", href: "/explains" },
  { label: "Compares", href: "/compares" },
  { label: "Playbooks", href: "/playbooks" },
];

export const FOOTER_PRODUCTS: NavItem[] = [
  { label: "AI Compliance Kit", href: "/kit/ai-compliance" },
  { label: "Readiness Audit", href: "/audit" },
  { label: "Subscribe", href: "/subscribe" },
];

export const FOOTER_COMPANY: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Authors", href: "/authors" },
  { label: "Contact", href: "/contact" },
  { label: "Careers", href: "/careers" },
];

export const FOOTER_LEGAL: NavItem[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
  { label: "Refund", href: "/refund" },
  { label: "Editorial", href: "/editorial" },
  { label: "DMCA", href: "/dmca" },
];
