import { ROUTES } from "@/constants/routes";
import type { UserRole } from "@/types";

const DASHBOARD_ROLES: UserRole[] = ["owner", "manager"];

export function getPostAuthRedirectPath(role: unknown): string {
  if (typeof role === "string" && DASHBOARD_ROLES.includes(role as UserRole)) {
    return ROUTES.dashboard;
  }

  return ROUTES.customers;
}
