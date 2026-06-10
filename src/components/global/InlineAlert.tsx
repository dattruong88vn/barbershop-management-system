import { cn } from "@/lib/utils";
import type { InlineAlertProps } from "@/types";

export function InlineAlert({ children, className }: InlineAlertProps) {
  if (!children) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border border-red-900/30 bg-red-100 px-3 py-2 text-copy-13 text-red-900",
        className,
      )}
    >
      {children}
    </div>
  );
}
