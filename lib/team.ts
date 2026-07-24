import type { Author } from "@/types";

export interface TeamMember extends Author {
  credentials: string;
  /** Optional taller crop for About masthead */
  portrait?: string;
}

export const TEAM: TeamMember[] = [
  {
    slug: "shiv-shakti-mishra",
    name: "Shiv Shakti Mishra",
    title: "Editor-in-Chief",
    credentials:
      "Full-time engineer who ships production systems by day and stress-tests AI tools — and game metas — after hours. Shiv Shakti Mishra founded IndiaAIBrief because Indian founders and CTOs deserve intelligence from someone who writes code, not slide decks: what actually deploys, what breaks under load, and what it costs in INR.",
    bio: "Full-time engineer, AI enthusiast, and gamer. Editor-in-Chief of IndiaAIBrief — India-first intelligence for decision-makers who need signal, not hype.",
    avatar: "/images/authors/shiv-shakti-mishra-portrait.webp",
    portrait: "/images/authors/shiv-shakti-mishra-portrait.webp",
    twitter: "https://x.com/indiaaibrief",
    linkedin: "https://www.linkedin.com/company/indiaaibrief",
    url: "/authors/shiv-shakti-mishra",
  },
  {
    slug: "arjun-nair",
    name: "Arjun Nair",
    title: "Head of Intelligence",
    credentials:
      "Ex-GCC AI CoE; builds Startup Tracker, Policy Tracker, and original funding/policy datasets.",
    bio: "Owns data products and research methodology.",
    avatar: "/images/authors/arjun-nair.webp",
    twitter: "https://x.com/indiaaibrief",
    linkedin: "https://www.linkedin.com/company/indiaaibrief",
    url: "/authors/arjun-nair",
  },
  {
    slug: "indiaaibrief-desk",
    name: "IndiaAIBrief Desk",
    title: "Editorial Desk",
    credentials:
      "Collective byline for verified briefs — AI-assisted drafts, human fact-check on every claim.",
    bio: "Original Indian AI intelligence for founders, CTOs, MSMEs, and policymakers.",
    avatar: "/images/authors/indiaaibrief-desk.webp",
    twitter: "https://x.com/indiaaibrief",
    linkedin: "https://www.linkedin.com/company/indiaaibrief",
    url: "/authors/indiaaibrief-desk",
  },
];
