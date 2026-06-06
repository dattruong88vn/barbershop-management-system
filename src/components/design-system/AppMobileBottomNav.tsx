"use client";

import { BarChart3, Clock, Plus, Search } from "lucide-react";

import { commonTexts } from "@/constants/texts";
import { MobileBottomNavigation } from "@/components/design-system/MobileBottomNavigation";

export type AppMobileNavKey = "today" | "search" | "create" | "reports";

export function AppMobileBottomNav({
  activeItem,
  onCreate,
}: {
  activeItem: AppMobileNavKey;
  onCreate?: () => void;
}) {
  return (
    <MobileBottomNavigation
      items={[
        {
          icon: Clock,
          isActive: activeItem === "today",
          label: commonTexts.navigation.today,
        },
        {
          icon: Search,
          isActive: activeItem === "search",
          label: commonTexts.navigation.search,
        },
        {
          icon: Plus,
          isActive: activeItem === "create",
          isPrimary: true,
          label: commonTexts.navigation.create,
          onClick: onCreate,
        },
        {
          icon: BarChart3,
          isActive: activeItem === "reports",
          label: commonTexts.navigation.reports,
        },
      ]}
    />
  );
}
