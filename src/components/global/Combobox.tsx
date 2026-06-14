"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type ComboboxOption = {
  label: string;
  value: string;
};

export function Combobox({
  label,
  onValueChange,
  options,
  placeholder,
  value,
}: {
  label: string;
  onValueChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder: string;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const fieldId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption?.label ?? placeholder;

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
    onValueChange(nextValue);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-controls={`${fieldId}-listbox`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        role="combobox"
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-foreground outline-none transition hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <span className={selectedOption ? "text-foreground/90" : "text-muted-foreground"}>
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
          className="absolute inset-x-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border border-border bg-background p-1 shadow-lg"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className="flex min-h-10 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-foreground transition hover:bg-muted"
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
              {option.value === value ? (
                <Check className="size-4" aria-hidden="true" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
