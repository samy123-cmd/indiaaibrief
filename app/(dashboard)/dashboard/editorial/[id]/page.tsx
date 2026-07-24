import { notFound, redirect } from "next/navigation";
import { EditorialNav } from "@/components/editorial/editorial-nav";
import { SignalDetailClient } from "@/components/editorial/signal-detail-client";
import { canAccessEditorial } from "@/lib/editorial/auth";
import {
  getRelatedSignals,
  getSignalById,
} from "@/lib/editorial/queries";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return buildMetadata({
    title: `Signal ${id.slice(0, 8)}`,
    description: "Editorial signal detail",
    path: `/dashboard/editorial/${id}`,
    noIndex: true,
  });
}

export default async function SignalDetailPage({ params }: PageProps) {
  const allowed = await canAccessEditorial();
  if (!allowed) redirect("/dashboard");

  const { id } = await params;
  const signal = await getSignalById(id);
  if (!signal) notFound();

  const related = await getRelatedSignals(
    signal.id,
    signal.tags,
    signal.relatedStartups,
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <EditorialNav />
      <SignalDetailClient signal={signal} related={related} />
    </div>
  );
}
