import { Heading, KeyValueRow } from "@/components/global";
import { reportTexts } from "@/constants/texts";
import type { PersonalReportMetric } from "@/types";

export function PersonalReportGeneralInfoCard({
  metrics,
}: {
  metrics: PersonalReportMetric[];
}) {
  return (
    <section className="rounded-xl border border-border bg-background p-4">
      <Heading>{reportTexts.personal.generalInfoTitle}</Heading>
      <div className="mt-3 grid gap-3">
        {metrics.map((metric) => (
          <KeyValueRow
            key={metric.label}
            title={metric.label}
            value={metric.value}
          />
        ))}
      </div>
    </section>
  );
}
