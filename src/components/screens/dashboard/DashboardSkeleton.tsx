import { Skeleton } from "@/components/global";
import { dashboardTexts } from "@/constants/texts";

export function DashboardSkeleton() {
  return (
    <div aria-label={dashboardTexts.loading} className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-4">
        <Skeleton className="h-32" variant="card" />
        <Skeleton className="h-32" variant="card" />
        <Skeleton className="h-32" variant="card" />
        <Skeleton className="h-32" variant="card" />
      </div>
      <Skeleton className="h-96" variant="card" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72" variant="card" />
        <Skeleton className="h-72" variant="card" />
        <Skeleton className="h-72" variant="card" />
        <Skeleton className="h-72" variant="card" />
      </div>
      <Skeleton className="h-40" variant="card" />
    </div>
  );
}
