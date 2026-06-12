import { CalendarClock, Home, Plus, Scissors, Search } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { authTexts, customerTexts } from "@/constants/texts";
import { CustomerDesktopNavItem } from "./CustomerDesktopNavItem";

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
