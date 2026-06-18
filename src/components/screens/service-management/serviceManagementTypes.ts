import type { BadgeProps } from "@/components/global";
import {
  SERVICE_RESPONSIBLE_ROLE_BARBER,
  SERVICE_RESPONSIBLE_ROLE_SKINNER,
  SERVICE_SCOPE_BRANCH,
  SERVICE_SCOPE_SHOP,
  UI_VARIANT_INFO,
  UI_VARIANT_SUCCESS,
  UI_VARIANT_WARNING,
  type ServiceResponsibleRoleValue,
  type ServiceScopeValue,
} from "@/constants/common";

export const SERVICE_RESPONSIBLE_ROLE_BADGE_VARIANTS: Record<
  ServiceResponsibleRoleValue,
  BadgeProps["variant"]
> = {
  [SERVICE_RESPONSIBLE_ROLE_BARBER]: UI_VARIANT_INFO,
  [SERVICE_RESPONSIBLE_ROLE_SKINNER]: UI_VARIANT_SUCCESS,
};

export const SERVICE_SCOPE_BADGE_VARIANTS: Record<
  ServiceScopeValue,
  BadgeProps["variant"]
> = {
  [SERVICE_SCOPE_BRANCH]: UI_VARIANT_WARNING,
  [SERVICE_SCOPE_SHOP]: UI_VARIANT_INFO,
};
