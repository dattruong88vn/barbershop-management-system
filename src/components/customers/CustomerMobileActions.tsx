import { BarChart3, Clock, Search, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { customerTexts } from "@/constants/texts";
import { cn } from "@/lib/utils";
import type { CustomerMobileActionsProps } from "@/types";

const MOBILE_NAV_ITEMS = [
  { icon: Clock, label: customerTexts.lookup.navToday },
  { icon: Search, label: customerTexts.lookup.navSearch, active: true },
  { icon: UserPlus, label: customerTexts.lookup.navCreate },
  { icon: BarChart3, label: customerTexts.lookup.navReports },
];

export function CustomerMobileActions({
  onCreateCustomer,
}: CustomerMobileActionsProps) {
  return (
    <>
      <Button
        type="button"
        variant="primary"
        onClick={onCreateCustomer}
        className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 shadow-lg md:hidden"
      >
        <UserPlus className="size-4" aria-hidden="true" />
        {customerTexts.lookup.createOption}
      </Button>

      <nav className="fixed inset-x-0 bottom-0 grid h-14 grid-cols-4 border-t border-gray-400 bg-background-100 md:hidden">
        {MOBILE_NAV_ITEMS.map(({ active, icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 text-label-12",
              active ? "text-gray-1000" : "text-gray-700",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
