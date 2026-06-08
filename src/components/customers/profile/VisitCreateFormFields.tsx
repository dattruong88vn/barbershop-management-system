import type { ChangeEventHandler } from "react";

import type { VisitCreateItem, VisitCreateStaff } from "@/types";

const PRICE_FORMATTER = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

export function VisitCreateItemSelector({
  emptyText,
  items,
  label,
  onToggleItem,
  selectedIds,
}: {
  emptyText: string;
  items: VisitCreateItem[];
  label: string;
  onToggleItem: (id: string) => void;
  selectedIds: string[];
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-foreground">{label}</legend>
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
                  onChange={() => onToggleItem(item.id)}
                  className="h-4 w-4 rounded border-border"
                />
                <span>{item.name}</span>
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
  label,
  noStaffOption,
  onChange,
  staff,
  value,
}: {
  label: string;
  noStaffOption: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  staff: VisitCreateStaff[];
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring"
      >
        <option value="">{noStaffOption}</option>
        {staff.map((staffMember) => (
          <option key={staffMember.id} value={staffMember.id}>
            {staffMember.username}
          </option>
        ))}
      </select>
    </label>
  );
}
