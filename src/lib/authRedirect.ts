import { MANAGEMENT_ROLES, USER_ROLE_MANAGER } from "@/constants/common";
import { ROUTES } from "@/constants/routes";

export function getPostAuthRedirectPath(role: unknown): string {
  if (role === USER_ROLE_MANAGER) {
    return ROUTES.managerSelectBranch;
  }

  if (
    typeof role === "string" &&
    MANAGEMENT_ROLES.some((dashboardRole) => dashboardRole === role)
  ) {
    return ROUTES.dashboard;
  }

  return ROUTES.customers;
}
