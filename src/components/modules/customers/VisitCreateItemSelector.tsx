import { formatVndPrice } from "@/utils/common/formatters";
import type { VisitCreateItem } from "@/types";

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
                {formatVndPrice(item.price)}
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
