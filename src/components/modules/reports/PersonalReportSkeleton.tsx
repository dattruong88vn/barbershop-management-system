import { Skeleton } from "@/components/global";
import { reportTexts } from "@/constants/texts";

export function PersonalReportSkeleton() {
  return (
    <div aria-label={reportTexts.personal.loading} className="space-y-4">
      <Skeleton className="h-24" variant="card" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-32" variant="card" />
        <Skeleton className="h-32" variant="card" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-24" variant="card" />
        <Skeleton className="h-24" variant="card" />
      </div>
      <Skeleton className="h-48" variant="card" />
    </div>
  );
}
