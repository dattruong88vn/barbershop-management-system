import Link from "next/link";
import * as React from "react";
import { ChevronDown } from "lucide-react";

import { designSystemTexts } from "@/constants/texts";
import { cn } from "@/lib/utils";

export interface GeistCardProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
  padding?: "sm" | "md" | "lg";
}

export const GeistCard = React.forwardRef<HTMLDivElement, GeistCardProps>(
  (
    { bordered = true, children, className, padding = "md", ...props },
    ref,
  ) => {
    const paddings = {
      lg: "p-6",
      md: "p-4",
      sm: "p-3",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl bg-gray-100",
          bordered && "border border-gray-400",
          paddings[padding],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
GeistCard.displayName = "GeistCard";

export interface GeistTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  tabs: { icon?: React.ReactNode; label: string; value: string }[];
}

export const GeistTabs = React.forwardRef<HTMLDivElement, GeistTabsProps>(
  (
    { children, className, defaultValue, onValueChange, tabs, ...props },
    ref,
  ) => {
    const [activeTab, setActiveTab] = React.useState(
      defaultValue ?? tabs[0]?.value,
    );

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className="flex gap-2 border-b border-gray-400">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={cn(
                "-mb-px flex min-h-11 items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.value
                  ? "border-gray-1000 text-gray-1000"
                  : "border-transparent text-gray-700 hover:text-gray-1000",
              )}
              type="button"
              onClick={() => {
                setActiveTab(tab.value);
                onValueChange?.(tab.value);
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div>{children}</div>
      </div>
    );
  },
);
GeistTabs.displayName = "GeistTabs";

export interface GeistCollapseProps
  extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  title: string;
}

export const GeistCollapse = React.forwardRef<
  HTMLDivElement,
  GeistCollapseProps
>(
  (
    { children, className, defaultOpen = false, icon, title, ...props },
    ref,
  ) => {
    const [open, setOpen] = React.useState(defaultOpen);

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden rounded-xl border border-gray-400",
          className,
        )}
        {...props}
      >
        <button
          className="flex min-h-11 w-full items-center justify-between gap-2 bg-gray-200 px-4 py-3 text-sm font-medium text-gray-1000 hover:bg-gray-300"
          type="button"
          onClick={() => setOpen((currentOpen) => !currentOpen)}
        >
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        {open ? <div className="px-4 py-3">{children}</div> : null}
      </div>
    );
  },
);
GeistCollapse.displayName = "GeistCollapse";

export interface GeistBreadcrumbsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: { href?: string; label: string }[];
}

export const GeistBreadcrumbs = React.forwardRef<
  HTMLDivElement,
  GeistBreadcrumbsProps
>(({ className, items, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label="Breadcrumb"
    className={cn("flex items-center gap-2 text-sm", className)}
    {...props}
  >
    {items.map((item, index) => (
      <React.Fragment key={`${item.label}-${index}`}>
        {index > 0 ? <span className="text-gray-600">/</span> : null}
        {item.href ? (
          <Link className="text-blue-900 hover:underline" href={item.href}>
            {item.label}
          </Link>
        ) : (
          <span className="text-gray-1000">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
));
GeistBreadcrumbs.displayName = "GeistBreadcrumbs";

export interface GeistPaginationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

export const GeistPagination = React.forwardRef<
  HTMLDivElement,
  GeistPaginationProps
>(
  ({ className, currentPage, onPageChange, totalPages, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    >
      <button
        className="min-h-11 rounded-md border border-gray-400 px-3 py-2 text-sm font-medium text-gray-1000 disabled:opacity-50"
        disabled={currentPage === 1}
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        {designSystemTexts.actions.previous}
      </button>
      {Array.from({ length: totalPages }).map((_, index) => {
        const page = index + 1;

        return (
          <button
            key={page}
            className={cn(
              "size-11 rounded-md border text-sm font-medium transition-colors",
              currentPage === page
                ? "border-gray-1000 bg-gray-1000 text-background-100"
                : "border-gray-400 text-gray-1000 hover:bg-gray-200",
            )}
            type="button"
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        );
      })}
      <button
        className="min-h-11 rounded-md border border-gray-400 px-3 py-2 text-sm font-medium text-gray-1000 disabled:opacity-50"
        disabled={currentPage === totalPages}
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        {designSystemTexts.actions.next}
      </button>
    </div>
  ),
);
GeistPagination.displayName = "GeistPagination";

export interface GeistGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
}

export const GeistGrid = React.forwardRef<HTMLDivElement, GeistGridProps>(
  ({ children, className, columns = 3, gap = "md", ...props }, ref) => {
    const gaps = { lg: "gap-6", md: "gap-4", sm: "gap-2" };
    const columnsMap = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    return (
      <div
        ref={ref}
        className={cn("grid", columnsMap[columns], gaps[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
GeistGrid.displayName = "GeistGrid";
