"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { commonTexts } from "@/constants/texts";
import { cn } from "@/lib/utils";

import { GeistSearchInput } from "./Inputs";

export type ComboboxOption = {
  label: string;
  value: string;
};

export function Combobox({
  label,
  emptyMessage,
  onValueChange,
  options,
  placeholder,
  searchable = false,
  searchPlaceholder,
  value,
}: {
  label: string;
  emptyMessage?: string;
  onValueChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const fieldId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption?.label ?? placeholder;
  const normalizedSearch = search.trim().toLowerCase();
  const visibleOptions = normalizedSearch
    ? options.filter((option) =>
        option.label.toLowerCase().includes(normalizedSearch),
      )
    : options;

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
    setSearch("");
    setOpen(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSearch("");
    }
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
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left text-base text-foreground outline-none transition hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        onClick={() => handleOpenChange(!open)}
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
          {searchable ? (
            <div className="border-b border-border p-2">
              <GeistSearchInput
                autoFocus
                clearLabel={commonTexts.feedback.clearSearch}
                placeholder={searchPlaceholder}
                value={search}
                onClear={() => setSearch("")}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          ) : null}

          {visibleOptions.map((option) => (
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

          {visibleOptions.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              {emptyMessage ?? placeholder}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
