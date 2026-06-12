import { Skeleton } from "@/components/global/Skeleton";

export function CustomerSectionSkeleton({
  itemCount,
  variant,
}: {
  itemCount: number;
  variant: "chips" | "photos" | "rows";
}) {
  return (
    <div className="mt-4" aria-hidden="true">
      {variant === "chips" ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: itemCount }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-28 rounded-lg" />
          ))}
        </div>
      ) : null}

      {variant === "photos" ? (
        <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3">
          {Array.from({ length: itemCount }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : null}

      {variant === "rows" ? (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-background md:border-0">
          {Array.from({ length: itemCount }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-3 py-3 md:px-0 md:py-4"
            >
              <Skeleton className="size-2 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
              <Skeleton className="size-4 shrink-0" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
