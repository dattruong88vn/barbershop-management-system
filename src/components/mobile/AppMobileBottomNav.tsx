"use client";

import { signOut } from "next-auth/react";
import { BarChart3, Clock, LogOut, Search } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { commonTexts } from "@/constants/texts";
import { MobileBottomNavigation } from "@/components/mobile/MobileBottomNavigation";

export type AppMobileNavKey = "today" | "search" | "reports";

export function AppMobileBottomNav({
  activeItem,
}: {
  activeItem: AppMobileNavKey;
}) {
  function handleLogout() {
    void signOut({ callbackUrl: ROUTES.login });
  }

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
          href: ROUTES.reports,
          icon: BarChart3,
          isActive: activeItem === "reports",
          label: commonTexts.navigation.reports,
        },
        {
          icon: LogOut,
          label: commonTexts.navigation.logout,
          onClick: handleLogout,
        },
      ]}
    />
  );
}
