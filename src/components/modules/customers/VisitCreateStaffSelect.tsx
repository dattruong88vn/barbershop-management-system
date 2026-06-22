import { useId } from "react";

import { Combobox, type ComboboxOption } from "@/components/global";
import type { VisitCreateStaff } from "@/types";
import { getStaffDisplayName } from "@/utils/staff";

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
  const fieldId = useId();
  const staffOptions: ComboboxOption[] = [
    { label: placeholder, value: "" },
    ...staff.map((staffMember) => ({
      label: getStaffDisplayName(staffMember),
      value: staffMember.id,
    })),
  ];
  const displayOptions =
    isSkipped && skipOptionLabel
      ? [{ label: skipOptionLabel, value: "" }, ...staffOptions.slice(1)]
      : staffOptions;

  function handleSelect(nextValue: string) {
    onSkippedChange?.(false);
    onValueChange(nextValue);
  }

  function handleToggleSkipped(checked: boolean) {
    onSkippedChange?.(checked);

    if (checked) {
      onValueChange("");
    }
  }

  return (
    <div>
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
      <div className="mt-2">
        <Combobox
          label={label}
          options={displayOptions}
          placeholder={placeholder}
          value={value}
          onValueChange={handleSelect}
        />
      </div>
    </div>
  );
}
