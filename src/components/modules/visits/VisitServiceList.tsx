import { formatMoney } from "@/lib/customerVisitDisplay";
import type { CustomerVisitService } from "@/types";

export function VisitServiceList({
  emptyText,
  services,
}: {
  emptyText: string;
  services: CustomerVisitService[];
}) {
  if (!services.length) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {services.map((service) => (
        <div
          key={service.id}
          className="flex items-center justify-between gap-4 px-3 py-3 text-sm"
        >
          <span className="min-w-0 truncate text-foreground">{service.name}</span>
          <span className="shrink-0 font-medium text-muted-foreground">
            {formatMoney(service.price)}
          </span>
        </div>
      ))}
    </div>
  );
}
