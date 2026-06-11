"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type MobileBottomNavigationItem = {
  href?: string;
  icon: LucideIcon;
  isActive?: boolean;
  isPrimary?: boolean;
  label: string;
  onClick?: () => void;
};

export function MobileBottomNavigation({
  items,
}: {
  items: MobileBottomNavigationItem[];
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid h-14 border-t border-border bg-background md:hidden"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map(({ href, icon: Icon, isActive, isPrimary, label, onClick }) => {
        const className = cn(
          "flex flex-col items-center justify-center gap-0.5 text-[10px]",
          isActive ? "text-foreground" : "text-muted-foreground",
        );
        const content = isPrimary ? (
          <span className="flex size-9 items-center justify-center rounded-full bg-foreground text-background">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        ) : (
          <>
            <Icon className="size-5" aria-hidden="true" />
            {label}
          </>
        );

        return href ? (
          <Link
            key={label}
            href={href}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
            className={className}
          >
            {content}
          </Link>
        ) : (
          <button
            key={label}
            type="button"
            onClick={onClick}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
            className={className}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
