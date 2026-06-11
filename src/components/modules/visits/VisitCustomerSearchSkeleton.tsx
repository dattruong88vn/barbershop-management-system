import { Skeleton } from "@/components/global/Skeleton";

export function VisitCustomerSearchSkeleton() {
  return (
    <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
