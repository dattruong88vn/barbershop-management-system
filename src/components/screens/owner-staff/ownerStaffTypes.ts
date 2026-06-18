import type { BadgeProps } from "@/components/global";
import type { StaffRole } from "@/types";
import type { StaffDisplayStatus } from "@/utils/staff";

export type StaffStatusFilter = StaffDisplayStatus | "all";
export type StaffRoleFilter = StaffRole | "all";

export type StaffFilters = {
  branchId: string;
  role: StaffRoleFilter;
  search: string;
  status: StaffStatusFilter;
};

export type StaffBadgeVariant = NonNullable<BadgeProps["variant"]>;

export const STAFF_ROLE_BADGE_VARIANTS: Record<
  StaffRole,
  StaffBadgeVariant
> = {
  barber: "info",
  manager: "default",
  receptionist: "warning",
  skinner: "success",
};

export const STAFF_STATUS_BADGE_VARIANTS: Record<
  StaffDisplayStatus,
  StaffBadgeVariant
> = {
  active: "info",
  initialized: "danger",
};
