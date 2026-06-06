import { Skeleton } from "@/components/design-system/Skeleton";

export function CustomerSearchSkeleton() {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-3 px-4 py-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2 opacity-70" />
          </div>
        </div>
      ))}
    </div>
  );
}
