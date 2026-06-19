import { Card, Skeleton } from "@/components/global";
import { staffTexts } from "@/constants/texts";

export function StaffFormSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <Card padding="lg" title={staffTexts.ownerStaff.personalSectionTitle}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Skeleton className="w-32" variant="text" />
            <Skeleton />
          </div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="space-y-2" key={index}>
              <Skeleton className="w-24" variant="text" />
              <Skeleton />
            </div>
          ))}
          <div className="space-y-2 sm:col-span-2">
            <Skeleton className="w-28" variant="text" />
            <Skeleton />
          </div>
        </div>
      </Card>

      <Card padding="lg" title={staffTexts.ownerStaff.identitySectionTitle}>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div className="space-y-2" key={index}>
              <Skeleton className="w-28" variant="text" />
              <Skeleton className="aspect-[1.586/1] h-auto" />
            </div>
          ))}
        </div>
      </Card>

      <Card padding="lg" title={staffTexts.ownerStaff.accountSectionTitle}>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="space-y-2" key={index}>
              <Skeleton className="w-28" variant="text" />
              <Skeleton />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
