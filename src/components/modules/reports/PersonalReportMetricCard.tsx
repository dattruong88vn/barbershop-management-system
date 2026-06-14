import { MetricValue, Paragraph } from "@/components/global";
import type { PersonalReportMetric } from "@/types";

export function PersonalReportMetricCard({
  metric,
}: {
  metric: PersonalReportMetric;
}) {
  return (
    <article className="rounded-xl border border-border bg-background p-4">
      <Paragraph tone="muted">{metric.label}</Paragraph>
      <MetricValue className="mt-2">{metric.value}</MetricValue>
    </article>
  );
}
