import { MetricValue, Paragraph } from "@/components/global";

export function PersonalReportSummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-background p-4">
      <Paragraph tone="muted">{label}</Paragraph>
      <MetricValue className="mt-3" size="lg">
        {value}
      </MetricValue>
    </article>
  );
}
