import { BarChart3 } from "lucide-react";

import { Heading } from "@/components/global";
import { EmptyState } from "@/components/global/EmptyState";
import { reportTexts } from "@/constants/texts";
import type { PersonalReportTopItem } from "@/types";

export function PersonalReportTopItems({
  items,
}: {
  items: PersonalReportTopItem[];
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <Heading>{reportTexts.personal.topItemTitle}</Heading>

      {items.length ? (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-3"
            >
              <span className="min-w-0 text-sm font-medium text-foreground">
                {item.name}
              </span>
              <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-900">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState icon={BarChart3} text={reportTexts.personal.empty} />
        </div>
      )}
    </div>
  );
}
