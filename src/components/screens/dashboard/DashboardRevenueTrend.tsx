"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltipContent,
  Heading,
} from "@/components/global";
import { dashboardTexts } from "@/constants/texts";
import type { DashboardTrendPoint } from "@/types";

const REVENUE_DATA_KEY = "revenue";
const VISITS_DATA_KEY = "visits";
const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

export function DashboardRevenueTrend({
  data,
}: {
  data: DashboardTrendPoint[];
}) {
  return (
    <section className="rounded-xl border border-gray-400 bg-gray-100 p-4">
      <Heading className="mb-4" level={3} size="section">
        {dashboardTexts.charts.revenueTrend}
      </Heading>
      <ChartContainer className="text-blue-900">
        <AreaChart data={data} margin={{ bottom: 0, left: 0, right: 0, top: 8 }}>
          <defs>
            <linearGradient id="dashboardRevenue" x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="5%"
                stopColor="currentColor"
                stopOpacity={0.24}
              />
              <stop
                offset="95%"
                stopColor="currentColor"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.12} vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            tickFormatter={(value) => VND_FORMATTER.format(Number(value))}
            tickLine={false}
            width={88}
          />
          <Tooltip
            content={
              <ChartTooltipContent
                valueFormatter={(value, item) =>
                  item.dataKey === REVENUE_DATA_KEY
                    ? VND_FORMATTER.format(Number(value))
                    : String(value)
                }
              />
            }
          />
          <Area
            dataKey={REVENUE_DATA_KEY}
            fill="url(#dashboardRevenue)"
            name={dashboardTexts.charts.revenue}
            stroke="currentColor"
            strokeWidth={2}
            type="monotone"
          />
          <Area
            dataKey={VISITS_DATA_KEY}
            fill="transparent"
            name={dashboardTexts.charts.visits}
            stroke="currentColor"
            strokeOpacity={0.42}
            strokeWidth={1.5}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    </section>
  );
}
