import type { CustomerEmptyStateProps } from "@/types";

export function CustomerEmptyState({
  action,
  icon: Icon,
  text,
}: CustomerEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-400 px-4 py-12 text-center">
      <Icon className="size-9 text-gray-700" aria-hidden="true" />
      <p className="mt-3 text-copy-13 text-gray-700">{text}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
