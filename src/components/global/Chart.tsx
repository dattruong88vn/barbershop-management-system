"use client";

import * as React from "react";
import { ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

export interface ChartContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement;
  minHeightClassName?: string;
}

export function ChartContainer({
  children,
  className,
  minHeightClassName = "h-72",
  ...props
}: ChartContainerProps) {
  return (
    <div
      className={cn("min-w-0 w-full", minHeightClassName, className)}
      data-chart=""
      {...props}
    >
      <ResponsiveContainer
        height="100%"
        initialDimension={{ height: 288, width: 1 }}
        minHeight={0}
        minWidth={0}
        width="100%"
      >
        {children}
      </ResponsiveContainer>
    </div>
  );
}

type ChartTooltipPayloadItem = {
  color?: string;
  dataKey?: string | number;
  name?: string | number;
  value?: string | number;
};

export type ChartTooltipContentProps = {
  active?: boolean;
  label?: string | number;
  labelFormatter?: (label: string | number) => string;
  payload?: ChartTooltipPayloadItem[];
  valueFormatter?: (value: string | number, item: ChartTooltipPayloadItem) => string;
};

export function ChartTooltipContent({
  active,
  label,
  labelFormatter = (tooltipLabel) => String(tooltipLabel),
  payload,
  valueFormatter = (value) => String(value),
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="min-w-36 rounded-xl border border-gray-400 bg-gray-100 p-3 text-label-13 text-gray-1000">
      {label !== undefined ? (
        <p className="mb-2 font-medium">{labelFormatter(label)}</p>
      ) : null}
      <div className="space-y-1.5">
        {payload.map((item) => (
          <div
            key={`${item.dataKey ?? item.name}`}
            className="flex items-center justify-between gap-4"
          >
            <span className="flex items-center gap-2 text-gray-700">
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>
            {item.value !== undefined ? (
              <span className="font-medium text-gray-1000">
                {valueFormatter(item.value, item)}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
