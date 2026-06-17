import {
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
  type ManagementRoleValue,
} from "@/constants/common";
import { ROUTES } from "@/constants/routes";
import type { UserRole } from "@/types";

const MANAGEMENT_NAVIGATION_PATHS = [
  ROUTES.dashboard,
  ROUTES.reports,
  ROUTES.ownerServices,
  ROUTES.ownerCombos,
  ROUTES.ownerStaff,
  ROUTES.ownerBranches,
  ROUTES.managerServices,
  ROUTES.managerCombos,
  ROUTES.managerStaff,
] as const;

const MANAGEMENT_ROLES = [USER_ROLE_OWNER, USER_ROLE_MANAGER] as const;

export function isManagementRole(
  role: UserRole | undefined,
): role is ManagementRoleValue {
  return MANAGEMENT_ROLES.some((managementRole) => managementRole === role);
}

export function isManagementPath(pathname: string): boolean {
  return MANAGEMENT_NAVIGATION_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
