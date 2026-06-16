"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Gauge,
  LogOut,
  Package,
  Scissors,
  Settings,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

import { USER_ROLE_OWNER } from "@/constants/common";
import { ROUTES } from "@/constants/routes";
import { commonTexts } from "@/constants/texts";
import { cn } from "@/lib/utils";
import { isManagementPath, isManagementRole } from "@/utils/common";

type ManagementNavigationItem = {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  ownerOnly?: boolean;
};

const REPORT_NAVIGATION_ITEMS: ManagementNavigationItem[] = [
  {
    href: ROUTES.reportRevenue,
    icon: BarChart3,
    label: commonTexts.navigation.reportRevenue,
  },
  {
    href: ROUTES.reportStaff,
    icon: Users,
    label: commonTexts.navigation.reportStaff,
  },
  {
    href: ROUTES.reportServices,
    icon: Scissors,
    label: commonTexts.navigation.reportServices,
  },
  {
    href: ROUTES.reportCombos,
    icon: Package,
    label: commonTexts.navigation.reportCombos,
  },
  {
    href: ROUTES.reportBranches,
    icon: Building2,
    label: commonTexts.navigation.reportBranches,
    ownerOnly: true,
  },
];

const MANAGEMENT_NAVIGATION_ITEMS: ManagementNavigationItem[] = [
  {
    href: ROUTES.dashboard,
    icon: Gauge,
    label: commonTexts.navigation.dashboard,
  },
  {
    href: ROUTES.ownerServices,
    icon: Scissors,
    label: commonTexts.navigation.services,
  },
  {
    href: ROUTES.ownerCombos,
    icon: Package,
    label: commonTexts.navigation.combos,
  },
  {
    href: ROUTES.ownerStaff,
    icon: Users,
    label: commonTexts.navigation.staff,
  },
  {
    href: ROUTES.ownerBranches,
    icon: Building2,
    label: commonTexts.navigation.branches,
    ownerOnly: true,
  },
];

export function ManagementSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user.role;

  if (!isManagementRole(role) || !isManagementPath(pathname)) {
    return null;
  }

  const reportItems = REPORT_NAVIGATION_ITEMS.filter(
    (item) => !item.ownerOnly || role === USER_ROLE_OWNER,
  );
  const navigationItems = MANAGEMENT_NAVIGATION_ITEMS.filter(
    (item) => !item.ownerOnly || role === USER_ROLE_OWNER,
  );

  function handleLogout() {
    void signOut({ callbackUrl: ROUTES.login });
  }

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[220px] flex-col border-r border-gray-400 bg-gray-100 lg:flex">
      <nav
        aria-label={commonTexts.navigation.management}
        className="flex flex-1 flex-col gap-1 p-3 pb-0"
      >
        <Link
          className={cn(
            "mb-2 flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-200 hover:text-gray-1000",
            pathname === ROUTES.dashboard
              ? "bg-gray-200 text-gray-1000"
              : "text-gray-900",
          )}
          href={ROUTES.dashboard}
        >
          <Gauge className="size-4" aria-hidden="true" />
          {commonTexts.navigation.dashboard}
        </Link>

        <div className="grid gap-1">
          <div className="flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-1000">
            <BriefcaseBusiness className="size-4" aria-hidden="true" />
            {commonTexts.navigation.reports}
          </div>
          <div className="grid gap-1 pl-6">
            {reportItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-200 hover:text-gray-1000",
                    pathname === item.href
                      ? "bg-gray-200 text-gray-1000"
                      : "text-gray-900",
                  )}
                  href={item.href}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {navigationItems
          .filter((item) => item.href !== ROUTES.dashboard)
          .map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-200 hover:text-gray-1000",
                  pathname === item.href
                    ? "bg-gray-200 text-gray-1000"
                    : "text-gray-900",
                )}
                href={item.href}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="grid gap-1 border-t border-gray-400 p-3">
        <button
          className="flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-200 hover:text-gray-1000"
          type="button"
        >
          <Settings className="size-4" aria-hidden="true" />
          {commonTexts.navigation.settings}
        </button>
        <button
          className="flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-200 hover:text-gray-1000"
          type="button"
          onClick={handleLogout}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {commonTexts.navigation.logout}
        </button>
      </div>
    </aside>
  );
}
