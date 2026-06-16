"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { isManagementPath, isManagementRole } from "@/utils/common";

export function ManagementSidebarContentOffset({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div
      className={cn(
        isManagementRole(session?.user.role) &&
          isManagementPath(pathname) &&
          "lg:pl-[220px]",
      )}
    >
      {children}
    </div>
  );
}
