import { MetricValue, Paragraph } from "@/components/global";
import type { DashboardMetric } from "@/types";

export function DashboardMetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <div className="min-h-32 rounded-xl border border-gray-400 bg-gray-100 p-4">
      <Paragraph tone="muted">{metric.label}</Paragraph>
      <MetricValue className="mt-3" size="lg">
        {metric.value}
      </MetricValue>
    </div>
  );
}
