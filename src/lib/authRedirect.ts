import { MANAGEMENT_ROLES } from "@/constants/common";
import { ROUTES } from "@/constants/routes";

export function getPostAuthRedirectPath(role: unknown): string {
  if (
    typeof role === "string" &&
    MANAGEMENT_ROLES.some((dashboardRole) => dashboardRole === role)
  ) {
    return ROUTES.dashboard;
  }

  return ROUTES.customers;
}
