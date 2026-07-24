import type { Author } from "@/types";
import { TEAM } from "@/lib/team";

export const DEFAULT_AUTHOR: Author = {
  slug: "indiaaibrief-desk",
  name: "IndiaAIBrief Desk",
  title: "Editorial Desk",
  bio: "Original Indian AI intelligence for founders, CTOs, MSMEs, and policymakers — not aggregation.",
  avatar: "/images/authors/indiaaibrief-desk.webp",
  twitter: "https://x.com/indiaaibrief",
  linkedin: "https://www.linkedin.com/company/indiaaibrief",
  url: "/authors/indiaaibrief-desk",
};

export const AUTHORS: Record<string, Author> = Object.fromEntries(
  TEAM.map((member) => [
    member.slug,
    {
      slug: member.slug,
      name: member.name,
      title: member.title,
      bio: member.bio,
      avatar: member.avatar,
      twitter: member.twitter,
      linkedin: member.linkedin,
      url: `/authors/${member.slug}`,
    } satisfies Author,
  ]),
);

if (!AUTHORS[DEFAULT_AUTHOR.slug]) {
  AUTHORS[DEFAULT_AUTHOR.slug] = DEFAULT_AUTHOR;
}

export function getAuthor(slug: string): Author {
  return AUTHORS[slug] ?? DEFAULT_AUTHOR;
}

export function getAllAuthors(): Author[] {
  return Object.values(AUTHORS);
}
