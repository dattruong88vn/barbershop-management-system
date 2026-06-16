import { BarChart3 } from "lucide-react";

import { Heading, KeyValueRow } from "@/components/global";
import { EmptyState } from "@/components/global/EmptyState";
import { reportTexts } from "@/constants/texts";
import type { PersonalReportTopItem } from "@/types";

export function PersonalReportTopItems({
  items,
  title = reportTexts.personal.topItemTitle,
}: {
  items: PersonalReportTopItem[];
  title?: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-background p-4">
      <Heading>{title}</Heading>

      {items.length ? (
        <div className="mt-3 grid gap-3">
          {items.map((item, index) => (
            <KeyValueRow
              key={`${item.name}-${index}`}
              title={item.name}
              value={item.count}
            />
          ))}
        </div>
      ) : (
        <div className="mt-3">
          <EmptyState icon={BarChart3} text={reportTexts.personal.empty} />
        </div>
      )}
    </section>
  );
}
