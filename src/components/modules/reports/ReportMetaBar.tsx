import { cn } from "@/lib/utils";

export type ReportMetaBarItem = {
  title: string;
  value: string;
};

export function ReportMetaBar({
  className,
  items,
}: {
  className?: string;
  items: ReportMetaBarItem[];
}) {
  return (
    <div
      className={cn(
        "grid gap-x-6 gap-y-2 md:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <div
          className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1"
          key={item.title}
        >
          <span className="shrink-0 text-base font-medium text-gray-700">
            {item.title}
          </span>
          <span className="min-w-0 break-words text-base font-semibold text-gray-1000">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
