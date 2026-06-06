import type { EmptyStateProps } from "@/types";

export function EmptyState({ action, icon: Icon, text }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background px-4 py-12 text-center">
      <Icon className="size-9 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
