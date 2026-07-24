import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleLoading() {
  return (
    <div className="pb-12" aria-busy="true">
      <div className="mx-auto w-full max-w-[680px] px-4 pt-8">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="mt-6 h-3 w-24" />
        <Skeleton className="mt-3 h-12 w-full" />
        <Skeleton className="mt-2 h-12 w-[80%]" />
        <Skeleton className="mt-4 h-4 w-64" />
        <Skeleton className="mt-4 h-9 w-24" />
      </div>
      <div className="mx-auto mt-8 w-full max-w-[1200px] px-4">
        <Skeleton className="aspect-[1200/630] w-full rounded-lg" />
      </div>
      <div className="mx-auto mt-8 w-full max-w-[680px] space-y-4 px-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="mt-6 h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[66%]" />
      </div>
    </div>
  );
}
