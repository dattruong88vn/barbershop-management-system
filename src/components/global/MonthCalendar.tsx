"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  UI_VARIANT_GHOST,
} from "@/constants/common";

import { Button } from "@/components/global/ui/button";
import { cn } from "@/lib/utils";

const MONTH_INDEXES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const MONTH_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  month: "short",
});

export function MonthCalendar({
  label,
  max,
  min,
  onValueChange,
  value,
}: {
  label: string;
  max: string;
  min: string;
  onValueChange: (value: string) => void;
  value: string;
}) {
  const valueYear = Number(value.slice(0, 4));
  const minYear = Number(min.slice(0, 4));
  const maxYear = Number(max.slice(0, 4));
  const minMonth = Number(min.slice(5, 7));
  const maxMonth = Number(max.slice(5, 7));
  const selectedMonth = Number(value.slice(5, 7));
  const [visibleYear, setVisibleYear] = useState(valueYear);
  const canGoPrevious = visibleYear > minYear;
  const canGoNext = visibleYear < maxYear;

  return (
    <div
      aria-label={label}
      className="rounded-xl border border-border bg-background p-3"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <Button
          aria-label="Tháng trước"
          disabled={!canGoPrevious}
          size="icon-sm"
          type="button"
          variant={UI_VARIANT_GHOST}
          onClick={() => setVisibleYear((currentYear) => currentYear - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>
        <span className="text-sm font-semibold text-foreground">
          {visibleYear}
        </span>
        <Button
          aria-label="Tháng sau"
          disabled={!canGoNext}
          size="icon-sm"
          type="button"
          variant={UI_VARIANT_GHOST}
          onClick={() => setVisibleYear((currentYear) => currentYear + 1)}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MONTH_INDEXES.map((monthIndex) => {
          const monthNumber = monthIndex + 1;
          const monthValue = `${visibleYear}-${String(monthNumber).padStart(2, "0")}`;
          const isBeforeMinimum =
            visibleYear < minYear ||
            (visibleYear === minYear && monthNumber < minMonth);
          const isAfterMaximum =
            visibleYear > maxYear ||
            (visibleYear === maxYear && monthNumber > maxMonth);
          const isDisabled = isBeforeMinimum || isAfterMaximum;
          const isSelected =
            visibleYear === valueYear && monthNumber === selectedMonth;

          return (
            <Button
              key={monthValue}
              aria-pressed={isSelected}
              className={cn(
                "h-10 rounded-lg",
                isSelected ? undefined : "border-border bg-background",
              )}
              disabled={isDisabled}
              type="button"
              variant={isSelected ? "primary" : "outline"}
              onClick={() => onValueChange(monthValue)}
            >
              {MONTH_FORMATTER.format(new Date(visibleYear, monthIndex, 1))}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
