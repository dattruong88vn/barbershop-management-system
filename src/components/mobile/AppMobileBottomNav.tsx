"use client";

import { BarChart3, Clock, Plus, Search } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { commonTexts } from "@/constants/texts";
import { MobileBottomNavigation } from "@/components/mobile/MobileBottomNavigation";

export type AppMobileNavKey = "today" | "search" | "create" | "reports";

export function AppMobileBottomNav({
  activeItem,
}: {
  activeItem: AppMobileNavKey;
}) {
  return (
    <MobileBottomNavigation
      items={[
        {
          href: ROUTES.visits,
          icon: Clock,
          isActive: activeItem === "today",
          label: commonTexts.navigation.today,
        },
        {
          href: ROUTES.customers,
          icon: Search,
          isActive: activeItem === "search",
          label: commonTexts.navigation.search,
        },
        {
          href: ROUTES.createVisit,
          icon: Plus,
          isActive: activeItem === "create",
          isPrimary: true,
          label: commonTexts.navigation.create,
        },
        {
          href: ROUTES.reports,
          icon: BarChart3,
          isActive: activeItem === "reports",
          label: commonTexts.navigation.reports,
        },
      ]}
    />
  );
}
