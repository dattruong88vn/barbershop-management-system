import * as React from "react";

import { cn } from "@/lib/utils";

export interface GeistAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  alt?: string;
  color?: "gray" | "blue" | "green" | "red" | "amber";
  initials?: string;
  size?: "sm" | "md" | "lg";
  src?: string;
}

export const GeistAvatar = React.forwardRef<HTMLDivElement, GeistAvatarProps>(
  (
    {
      alt = "",
      className,
      color = "gray",
      initials,
      size = "md",
      src,
      ...props
    },
    ref,
  ) => {
    const sizes = { lg: "size-12", md: "size-10", sm: "size-8" };
    const textSizes = { lg: "text-base", md: "text-sm", sm: "text-xs" };
    const colors = {
      amber: "bg-amber-100 text-amber-900",
      blue: "bg-blue-100 text-blue-900",
      gray: "bg-gray-300 text-gray-1000",
      green: "bg-green-100 text-green-900",
      red: "bg-red-100 text-red-900",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full",
          sizes[size],
          colors[color],
          className,
        )}
        {...props}
      >
        {src ? (
          <img alt={alt} className="size-full object-cover" src={src} />
        ) : (
          <span className={cn("font-semibold", textSizes[size])}>
            {initials}
          </span>
        )}
      </div>
    );
  },
);
GeistAvatar.displayName = "GeistAvatar";

export interface GeistStatusDotProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  status?: "online" | "offline" | "idle" | "busy";
}

export const GeistStatusDot = React.forwardRef<
  HTMLDivElement,
  GeistStatusDotProps
>(({ className, size = "md", status = "online", ...props }, ref) => {
  const sizes = { lg: "size-4", md: "size-3", sm: "size-2" };
  const colors = {
    busy: "bg-red-900",
    idle: "bg-amber-900",
    offline: "bg-gray-500",
    online: "bg-green-900",
  };

  return (
    <div
      ref={ref}
      className={cn("rounded-full", sizes[size], colors[status], className)}
      {...props}
    />
  );
});
GeistStatusDot.displayName = "GeistStatusDot";

export interface GeistTableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {
  striped?: boolean;
}

export const GeistTable = React.forwardRef<HTMLTableElement, GeistTableProps>(
  ({ className, ...props }, ref) => (
    <table
      ref={ref}
      className={cn("w-full border-collapse text-sm", className)}
      {...props}
    />
  ),
);
GeistTable.displayName = "GeistTable";

export type GeistTableHeadProps =
  React.HTMLAttributes<HTMLTableSectionElement>;

export const GeistTableHead = React.forwardRef<
  HTMLTableSectionElement,
  GeistTableHeadProps
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("border-b border-gray-400 bg-gray-200", className)}
    {...props}
  />
));
GeistTableHead.displayName = "GeistTableHead";

export type GeistTableBodyProps =
  React.HTMLAttributes<HTMLTableSectionElement>;

export const GeistTableBody = React.forwardRef<
  HTMLTableSectionElement,
  GeistTableBodyProps
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-gray-400", className)}
    {...props}
  />
));
GeistTableBody.displayName = "GeistTableBody";

export interface GeistTableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  interactive?: boolean;
}

export const GeistTableRow = React.forwardRef<
  HTMLTableRowElement,
  GeistTableRowProps
>(({ className, interactive = false, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors [&>*:last-child]:border-r-0 [&>*]:border-r [&>*]:border-gray-400",
      interactive && "cursor-pointer hover:bg-gray-200",
      className,
    )}
    {...props}
  />
));
GeistTableRow.displayName = "GeistTableRow";

export type GeistTableCellProps =
  React.TdHTMLAttributes<HTMLTableCellElement>;

export const GeistTableCell = React.forwardRef<
  HTMLTableCellElement,
  GeistTableCellProps
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-4 py-3 text-gray-1000", className)}
    {...props}
  />
));
GeistTableCell.displayName = "GeistTableCell";

export interface GeistLoadingDotsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export const GeistLoadingDots = React.forwardRef<
  HTMLDivElement,
  GeistLoadingDotsProps
>(({ className, size = "md", ...props }, ref) => {
  const sizes = { lg: "size-3", md: "size-2", sm: "size-1.5" };

  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-1", className)}
      {...props}
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            "animate-bounce rounded-full bg-gray-1000",
            sizes[size],
          )}
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  );
});
GeistLoadingDots.displayName = "GeistLoadingDots";

export interface GeistSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export const GeistSpinner = React.forwardRef<HTMLDivElement, GeistSpinnerProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizes = { lg: "size-8", md: "size-6", sm: "size-4" };

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <div
          className={cn(
            "animate-spin rounded-full border-2 border-gray-400 border-t-gray-1000",
            sizes[size],
          )}
        />
      </div>
    );
  },
);
GeistSpinner.displayName = "GeistSpinner";

export interface GeistProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  value: number;
}

export const GeistProgress = React.forwardRef<
  HTMLDivElement,
  GeistProgressProps
>(({ className, max = 100, value, ...props }, ref) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div
      ref={ref}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-gray-300",
        className,
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-blue-900 transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});
GeistProgress.displayName = "GeistProgress";

export interface GeistGaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  value: number;
}

export const GeistGauge = React.forwardRef<HTMLDivElement, GeistGaugeProps>(
  ({ className, max = 100, value, ...props }, ref) => {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset =
      circumference - (percentage / 100) * circumference;

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-300"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-blue-900 transition-all"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
          <text
            x="50"
            y="55"
            textAnchor="middle"
            className="fill-gray-1000 text-sm font-semibold"
          >
            {Math.round(percentage)}%
          </text>
        </svg>
      </div>
    );
  },
);
GeistGauge.displayName = "GeistGauge";
