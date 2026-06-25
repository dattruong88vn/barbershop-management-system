"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { GeistCalendar } from "./Specialized";

export type DateRangePickerValue = {
  fromDate: Date;
  toDate: Date;
};

type DateRangePickerProps = {
  fromDateLabel: string;
  label: string;
  maxDate?: Date;
  minDate?: Date;
  onChange: (value: DateRangePickerValue) => void;
  toDateLabel: string;
  value: DateRangePickerValue;
};

const DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function DateRangePicker({
  fromDateLabel,
  label,
  maxDate,
  minDate,
  onChange,
  toDateLabel,
  value,
}: DateRangePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative min-w-0 w-full">
      <span className="mb-2 block text-sm font-medium text-gray-1000">
        {label}
      </span>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="flex min-h-11 w-full min-w-0 items-center gap-3 rounded-md border border-gray-400 bg-gray-100 px-4 py-2 text-left text-gray-1000 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
        type="button"
        onClick={() => setIsOpen((currentOpen) => !currentOpen)}
      >
        <span className="min-w-0 flex-1 truncate text-base">
          {DISPLAY_DATE_FORMATTER.format(value.fromDate)}
          {" - "}
          {DISPLAY_DATE_FORMATTER.format(value.toDate)}
        </span>
        <CalendarDays
          aria-hidden="true"
          className="ml-auto size-4 shrink-0 text-gray-700"
        />
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-gray-700 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen ? (
        <div
          className="absolute left-0 top-full z-50 mt-2 grid w-[calc(100vw-3rem)] max-w-max gap-4 overflow-x-auto rounded-lg border border-gray-400 bg-gray-100 p-4 sm:w-max sm:max-w-[calc(100vw-3rem)] lg:grid-cols-2"
          role="dialog"
        >
          <div className="grid gap-2">
            <span className="text-sm font-medium">{fromDateLabel}</span>
            <GeistCalendar
              maxDate={value.toDate}
              minDate={minDate}
              value={value.fromDate}
              onChange={(fromDate) => onChange({ ...value, fromDate })}
            />
          </div>
          <div className="grid gap-2">
            <span className="text-sm font-medium">{toDateLabel}</span>
            <GeistCalendar
              maxDate={maxDate}
              minDate={value.fromDate}
              value={value.toDate}
              onChange={(toDate) => onChange({ ...value, toDate })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
