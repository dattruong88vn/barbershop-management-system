import { CalendarClock, Home, Plus, Scissors, Search, UserPlus } from "lucide-react";

import { authTexts, customerTexts } from "@/constants/texts";
import { cn } from "@/lib/utils";
import type { CustomerMobileHeaderProps } from "@/types";

const DESKTOP_NAV_ITEMS = [
  { icon: Home, label: customerTexts.lookup.navToday },
  { icon: Search, label: customerTexts.lookup.titleDesktop, active: true },
  { icon: Plus, label: customerTexts.lookup.navCreate },
  { icon: CalendarClock, label: customerTexts.lookup.navReports },
];

export function CustomerMobileHeader({
  onCreateCustomer,
}: CustomerMobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:hidden">
      <div className="size-8" aria-hidden="true" />
      <h1 className="text-sm font-semibold text-foreground">
        {customerTexts.lookup.title}
      </h1>
      <button
        type="button"
        onClick={onCreateCustomer}
        className="flex size-8 items-center justify-center rounded-full bg-foreground text-background"
        aria-label={customerTexts.lookup.createOption}
      >
        <UserPlus className="size-4" aria-hidden="true" />
      </button>
    </header>
  );
}

export function CustomerDesktopNav() {
  return (
    <aside className="hidden w-[220px] shrink-0 flex-col border-r border-border bg-background md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
          <Scissors className="size-4" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold text-foreground">
          {authTexts.brand.name}
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {DESKTOP_NAV_ITEMS.map(({ active, icon: Icon, label }) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
              active
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </div>
        ))}
      </nav>
    </aside>
  );
}
