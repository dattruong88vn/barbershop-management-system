import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { VisitCreateItem, VisitCreateStaff } from "@/types";

const PRICE_FORMATTER = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

export function VisitCreateItemSelector({
  disabled = false,
  emptyText,
  items,
  label,
  onToggleItem,
  selectedIds,
}: {
  disabled?: boolean;
  emptyText: string;
  items: VisitCreateItem[];
  label: string;
  onToggleItem: (id: string) => void;
  selectedIds: string[];
}) {
  return (
    <fieldset>
      <legend className="text-base font-semibold text-foreground">{label}</legend>
      {items.length ? (
        <div className="mt-2 space-y-2">
          {items.map((item) => (
            <label
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  disabled={disabled}
                  onChange={() => onToggleItem(item.id)}
                  className="h-4 w-4 rounded border-border disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span
                  className={disabled ? "text-muted-foreground" : "text-foreground/90"}
                >
                  {item.name}
                </span>
              </span>
              <span className="font-medium text-muted-foreground">
                {PRICE_FORMATTER.format(item.price)}
              </span>
            </label>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{emptyText}</p>
      )}
    </fieldset>
  );
}

export function VisitCreateStaffSelect({
  isSkipped = false,
  label,
  onSkippedChange,
  onValueChange,
  placeholder,
  skipOptionLabel,
  staff,
  value,
}: {
  isSkipped?: boolean;
  label: string;
  onSkippedChange?: (checked: boolean) => void;
  onValueChange: (value: string) => void;
  placeholder: string;
  skipOptionLabel?: string;
  staff: VisitCreateStaff[];
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const fieldId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedStaff = staff.find((staffMember) => staffMember.id === value);
  const displayText = isSkipped
    ? skipOptionLabel
    : selectedStaff?.username ?? placeholder;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  function handleSelect(nextValue: string) {
    onSkippedChange?.(false);
    onValueChange(nextValue);
    setOpen(false);
  }

  function handleToggleSkipped(checked: boolean) {
    onSkippedChange?.(checked);

    if (checked) {
      onValueChange("");
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center justify-between gap-3">
        <span id={fieldId} className="text-base font-semibold text-foreground">
          {label}
        </span>
        {skipOptionLabel && onSkippedChange ? (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={isSkipped}
              className="size-4 rounded border-border accent-foreground"
              onChange={(event) => handleToggleSkipped(event.target.checked)}
            />
            <span>{skipOptionLabel}</span>
          </label>
        ) : null}
      </div>
      <button
        type="button"
        aria-controls={`${fieldId}-listbox`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={fieldId}
        role="combobox"
        className="mt-2 flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-foreground outline-none transition hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <span
          className={
            selectedStaff || isSkipped ? "text-foreground/90" : "text-muted-foreground"
          }
        >
          {displayText}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open ? "rotate-180" : undefined,
          )}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div
          id={`${fieldId}-listbox`}
          role="listbox"
          aria-labelledby={fieldId}
          className="absolute inset-x-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border border-border bg-background p-1 shadow-lg"
        >
          <button
            type="button"
            role="option"
            aria-selected={!value && !isSkipped}
            className="flex min-h-10 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            onClick={() => handleSelect("")}
          >
            {placeholder}
            {!value && !isSkipped ? (
              <Check className="size-4" aria-hidden="true" />
            ) : null}
          </button>
          {staff.map((staffMember) => (
            <button
              key={staffMember.id}
              type="button"
              role="option"
              aria-selected={staffMember.id === value}
              className="flex min-h-10 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-foreground transition hover:bg-muted"
              onClick={() => handleSelect(staffMember.id)}
            >
              {staffMember.username}
              {staffMember.id === value ? (
                <Check className="size-4" aria-hidden="true" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
