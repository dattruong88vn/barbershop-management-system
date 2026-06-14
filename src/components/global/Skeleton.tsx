import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
  variant?: "card" | "text" | "circle" | "rect";
};

export function Skeleton({ className, variant = "rect" }: SkeletonProps) {
  const variants = {
    card: "rounded-xl border border-border bg-background",
    circle: "size-10 rounded-full",
    rect: "h-12 rounded-lg",
    text: "h-4 rounded",
  };

  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse bg-muted", variants[variant], className)}
    />
  );
}
