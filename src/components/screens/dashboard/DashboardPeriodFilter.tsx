"use client";

import { BadgeButton, Card, Select } from "@/components/global";
import {
  REPORT_PERIOD_ALL,
  REPORT_PERIOD_MONTH,
  REPORT_PERIOD_YEAR,
  type ReportPeriodValue,
  UI_VARIANT_WARNING,
} from "@/constants/common";
import { dashboardTexts } from "@/constants/texts";
import { cn } from "@/lib/utils";

type DashboardPeriodFilterProps = {
  branchId: string;
  branchOptions?: Array<{ label: string; value: string }>;
  onMonthPickerOpen: () => void;
  onBranchChange?: (branchId: string) => void;
  onPeriodChange: (period: ReportPeriodValue) => void;
  period: ReportPeriodValue;
};

export function DashboardPeriodFilter({
  branchId,
  branchOptions = [],
  onBranchChange,
  onMonthPickerOpen,
  onPeriodChange,
  period,
}: DashboardPeriodFilterProps) {
  const tabs = [
    {
      label: dashboardTexts.filters.periodOptions.month,
      value: REPORT_PERIOD_MONTH,
    },
    {
      label: dashboardTexts.filters.periodOptions.year,
      value: REPORT_PERIOD_YEAR,
    },
    {
      label: dashboardTexts.filters.periodOptions.all,
      value: REPORT_PERIOD_ALL,
    },
  ];

  return (
    <Card padding="md">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div
          className="inline-flex rounded-lg border border-gray-400 bg-gray-100 p-1"
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              aria-selected={period === tab.value}
              className={cn(
                "min-h-9 rounded-md px-3 text-label-14 font-medium text-gray-700 transition",
                period === tab.value
                  ? "bg-gray-1000 text-background-100"
                  : "hover:bg-gray-200 hover:text-gray-1000",
              )}
              role="tab"
              type="button"
              onClick={() => onPeriodChange(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {branchOptions.length > 0 && onBranchChange ? (
            <label className="grid min-w-56 gap-1 text-sm font-medium text-gray-1000">
              {dashboardTexts.filters.branchLabel}
              <Select
                value={branchId}
                onChange={(event) => onBranchChange(event.target.value)}
              >
                {branchOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
          ) : null}

          {period === REPORT_PERIOD_MONTH ? (
            <BadgeButton
              className="min-h-0 py-0.5"
              outline
              size="sm"
              variant={UI_VARIANT_WARNING}
              onClick={onMonthPickerOpen}
            >
              {dashboardTexts.filters.chooseSpecificMonth}
            </BadgeButton>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
