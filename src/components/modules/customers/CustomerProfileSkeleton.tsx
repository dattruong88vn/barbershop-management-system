import { Skeleton } from "@/components/global/Skeleton";

export function CustomerProfileSkeleton() {
  return (
    <section
      className="rounded-xl border border-border bg-background p-4 md:border-0 md:p-0"
      aria-hidden="true"
    >
      <div className="flex items-center gap-4 md:items-start">
        <Skeleton className="size-12 shrink-0 rounded-full md:size-16" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-40 md:h-5 md:w-56" />
          <Skeleton className="mt-2 h-3 w-32 md:w-40" />
          <Skeleton className="mt-2 hidden h-3 w-52 md:block" />
          <div className="mt-3 hidden gap-2 md:flex">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 md:mt-6 md:gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg bg-muted/50 px-2 py-3 md:border md:border-border md:bg-background md:px-4 md:py-4"
          >
            <Skeleton className="mx-auto h-5 w-10" />
            <Skeleton className="mx-auto mt-2 h-3 w-14" />
          </div>
        ))}
      </div>
    </section>
  );
}
