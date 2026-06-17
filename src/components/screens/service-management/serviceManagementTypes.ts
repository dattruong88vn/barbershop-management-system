import type { BadgeProps } from "@/components/global";
import {
  SERVICE_RESPONSIBLE_ROLE_BARBER,
  SERVICE_RESPONSIBLE_ROLE_SKINNER,
  SERVICE_SCOPE_BRANCH,
  SERVICE_SCOPE_SHOP,
  type ServiceResponsibleRoleValue,
  type ServiceScopeValue,
} from "@/constants/common";

export const SERVICE_RESPONSIBLE_ROLE_BADGE_VARIANTS: Record<
  ServiceResponsibleRoleValue,
  BadgeProps["variant"]
> = {
  [SERVICE_RESPONSIBLE_ROLE_BARBER]: "info",
  [SERVICE_RESPONSIBLE_ROLE_SKINNER]: "success",
};

export const SERVICE_SCOPE_BADGE_VARIANTS: Record<
  ServiceScopeValue,
  BadgeProps["variant"]
> = {
  [SERVICE_SCOPE_BRANCH]: "warning",
  [SERVICE_SCOPE_SHOP]: "info",
};
