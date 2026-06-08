import Link from "next/link";
import {
  CalendarClock,
  Home,
  type LucideIcon,
  Plus,
  Scissors,
  Search,
  UserPlus,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { authTexts, customerTexts } from "@/constants/texts";
import { cn } from "@/lib/utils";
import type { CustomerMobileHeaderProps } from "@/types";

const DESKTOP_NAV_ITEMS = [
  { href: ROUTES.visits, icon: Home, label: customerTexts.lookup.navToday },
  {
    active: true,
    href: ROUTES.customers,
    icon: Search,
    label: customerTexts.lookup.titleDesktop,
  },
  {
    href: ROUTES.createVisit,
    icon: Plus,
    label: customerTexts.lookup.navCreate,
  },
  {
    href: ROUTES.reports,
    icon: CalendarClock,
    label: customerTexts.lookup.navReports,
  },
];

function CustomerDesktopNavItem({
  active,
  href,
  icon: Icon,
  label,
}: {
  active?: boolean;
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-muted hover:text-foreground",
        active ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
}

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
        {DESKTOP_NAV_ITEMS.map(({ active, href, icon: Icon, label }) => (
          <CustomerDesktopNavItem
            key={label}
            active={active}
            href={href}
            icon={Icon}
            label={label}
          />
        ))}
      </nav>
    </aside>
  );
}
